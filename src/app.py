from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import yfinance as yf

# Add src to path to import local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from data_loader import fetch_stock_data
from preprocessing import add_technical_indicators, inverse_transform_predictions
from model import load_trained_model
from train import train_model
from sentiment import get_market_sentiment


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def get_prediction_data(ticker, days_ahead):
    """
    Logic adapted from predict.py to return data instead of printing/plotting.
    """
    try:
        # Load metadata
        metadata_path = f"models/{ticker}_metadata.json"
        
        # Auto-train if model doesn't exist
        if not os.path.exists(metadata_path):
            print(f"⚠️ Model for {ticker} not found. Starting auto-training...")
            try:
                train_model(ticker=ticker, epochs=20) # Lower epochs for speed
            except Exception as e:
                return None, f"Failed to auto-train model: {str(e)}"
        
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)

        
        sequence_length = metadata['sequence_length']
        num_features = metadata['num_features']
        
        # Load model and scaler
        model = load_trained_model(f"models/{ticker}_best_model.h5")
        scaler = joblib.load(f"models/{ticker}_scaler.pkl")
        
        # Fetch recent data
        df = fetch_stock_data(ticker, period="1y")
        df = add_technical_indicators(df)
        
        # Prepare features
        feature_columns = ['Close', 'Volume', 'SMA_20', 'SMA_50', 'EMA_12', 
                          'EMA_26', 'RSI', 'MACD', 'MACD_Signal']
        data = df[feature_columns].values
        
        # Scale data
        scaled_data = scaler.transform(data)
        
        # Get the last sequence for prediction
        last_sequence = scaled_data[-sequence_length:]
        
        # Make predictions
        predictions = []
        current_sequence = last_sequence.copy()
        
        for i in range(days_ahead):
            X_pred = current_sequence.reshape(1, sequence_length, num_features)
            pred_scaled = model.predict(X_pred, verbose=0)
            predictions.append(pred_scaled[0, 0])
            
            if i < days_ahead - 1:
                new_row = current_sequence[-1].copy()
                new_row[0] = pred_scaled[0, 0]
                current_sequence = np.vstack([current_sequence[1:], new_row])
        
        # Inverse transform
        predictions = np.array(predictions)
        predictions_original = inverse_transform_predictions(predictions, scaler, num_features)
        
        # Prepare response data
        current_price = df['Close'].iloc[-1]
        if isinstance(current_price, pd.Series):
            current_price = current_price.iloc[0]
        current_price = float(current_price)
        
        last_date = df['Date'].iloc[-1]
        if isinstance(last_date, pd.Series):
            last_date = last_date.iloc[0]
        last_date = pd.to_datetime(last_date)
        
        future_data = []
        for i, price in enumerate(predictions_original):
            date = last_date + timedelta(days=i+1)
            future_data.append({
                "date": date.strftime('%Y-%m-%d'),
                "price": float(price),
                "change_percent": ((price - current_price) / current_price) * 100
            })
            
        historical_data = []
        hist_df = df.tail(60)
        
        # calculate bollinger bands for the historical data to be drawn
        sma20 = df['Close'].rolling(20).mean()
        std20 = df['Close'].rolling(20).std()
        upper_bb = sma20 + (std20 * 2)
        lower_bb = sma20 - (std20 * 2)

        for idx, row in hist_df.iterrows():
            date_val = row['Date'] if 'Date' in row else idx
            if isinstance(date_val, pd.Series):
                date_val = date_val.iloc[0]
            
            close_val = row['Close']
            if isinstance(close_val, pd.Series):
                close_val = close_val.iloc[0]
                
            historical_data.append({
                "date": pd.to_datetime(date_val).strftime('%Y-%m-%d'),
                "open": float(row['Open']) if not isinstance(row['Open'], pd.Series) else float(row['Open'].iloc[0]),
                "high": float(row['High']) if not isinstance(row['High'], pd.Series) else float(row['High'].iloc[0]),
                "low": float(row['Low']) if not isinstance(row['Low'], pd.Series) else float(row['Low'].iloc[0]),
                "close": float(close_val),
                "volume": int(row['Volume']) if not isinstance(row['Volume'], pd.Series) else int(row['Volume'].iloc[0]),
                "rsi": float(row.get('RSI', 0)) if not isinstance(row.get('RSI', 0), pd.Series) else float(row.get('RSI', pd.Series([0])).iloc[0]),
                "macd": float(row.get('MACD', 0)) if not isinstance(row.get('MACD', 0), pd.Series) else float(row.get('MACD', pd.Series([0])).iloc[0]),
                "sma20": float(sma20.loc[idx]) if not pd.isna(sma20.loc[idx]) else None,
                "upper_bb": float(upper_bb.loc[idx]) if not pd.isna(upper_bb.loc[idx]) else None,
                "lower_bb": float(lower_bb.loc[idx]) if not pd.isna(lower_bb.loc[idx]) else None
            })

        # Backtesting for Historical Accuracy Tracker (Last 30 days)
        backtest_len = min(30, len(scaled_data) - sequence_length)
        backtest_data = []
        
        if backtest_len > 0:
            X_back = []
            for i in range(backtest_len, 0, -1):
                X_back.append(scaled_data[-(sequence_length + i) : -i])
            X_back = np.array(X_back)
            
            back_preds_scaled = model.predict(X_back, verbose=0)
            back_preds_orig = inverse_transform_predictions(back_preds_scaled.flatten(), scaler, num_features)
            
            actual_closes = df['Close'].values[-backtest_len:]
            dates_back = df['Date'].values[-backtest_len:]
            
            for i in range(backtest_len):
                d_val = dates_back[i]
                if isinstance(d_val, pd.Series):
                    d_val = d_val.iloc[0]
                
                actual_val = actual_closes[i]
                if isinstance(actual_val, pd.Series):
                    actual_val = actual_val.iloc[0]
                    
                backtest_data.append({
                    "date": pd.to_datetime(d_val).strftime('%Y-%m-%d'),
                    "predicted": float(back_preds_orig[i]),
                    "actual": float(actual_val)
                })

        return {
            "ticker": ticker,
            "current_price": current_price,
            "predictions": future_data,
            "historical": historical_data,
            "backtest": backtest_data,
            "metadata": metadata
        }, None

    except Exception as e:
        return None, str(e)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    ticker = data.get('ticker', 'AAPL')
    days = int(data.get('days', 7))
    
    result, error = get_prediction_data(ticker, days)
    
    if error:
        return jsonify({"error": error}), 400
        
    return jsonify(result)

@app.route('/sentiment', methods=['POST'])
def sentiment():
    data = request.get_json()
    ticker = data.get('ticker', 'AAPL')
    
    try:
        result = get_market_sentiment(ticker)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/market-overview', methods=['GET'])
def market_overview():
    """Returns live price and daily change for major indices."""
    symbols = ['SPY', 'QQQ', 'DIA', 'BTC-USD', 'AAPL', 'NVDA', 'TSLA', 'MSFT']
    result = []
    try:
        for sym in symbols:
            try:
                ticker_obj = yf.Ticker(sym)
                info = ticker_obj.fast_info
                current = float(info.last_price) if info.last_price else 0.0
                prev_close = float(info.previous_close) if info.previous_close else current
                change_pct = ((current - prev_close) / prev_close * 100) if prev_close else 0.0
                result.append({
                    "symbol": sym,
                    "price": round(current, 2),
                    "change_percent": round(change_pct, 2)
                })
            except Exception:
                result.append({"symbol": sym, "price": 0.0, "change_percent": 0.0})
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/compare', methods=['POST'])
def compare():
    """Returns predictions for two tickers for comparison."""
    data = request.get_json()
    ticker1 = data.get('ticker1', 'AAPL').upper()
    ticker2 = data.get('ticker2', 'MSFT').upper()
    days = int(data.get('days', 7))

    result1, err1 = get_prediction_data(ticker1, days)
    result2, err2 = get_prediction_data(ticker2, days)

    if err1:
        return jsonify({"error": f"{ticker1}: {err1}"}), 400
    if err2:
        return jsonify({"error": f"{ticker2}: {err2}"}), 400

    return jsonify({
        "ticker1": result1,
        "ticker2": result2
    })


@app.route('/watchlist-prices', methods=['POST'])
def watchlist_prices():
    """Batch fetch current prices for a list of tickers."""
    data = request.get_json()
    tickers = data.get('tickers', [])
    result = []
    for sym in tickers:
        try:
            ticker_obj = yf.Ticker(sym)
            info = ticker_obj.fast_info
            current = float(info.last_price) if info.last_price else 0.0
            prev_close = float(info.previous_close) if info.previous_close else current
            change_pct = ((current - prev_close) / prev_close * 100) if prev_close else 0.0
            result.append({
                "symbol": sym,
                "price": round(current, 2),
                "change_percent": round(change_pct, 2)
            })
        except Exception:
            result.append({"symbol": sym, "price": 0.0, "change_percent": 0.0})
    return jsonify(result)


@app.route('/stock-info', methods=['GET'])
def stock_info():
    """Returns company metadata: name, sector, market cap, PE, 52w high/low."""
    ticker = request.args.get('ticker', 'AAPL').upper()
    try:
        t = yf.Ticker(ticker)
        info = t.info or {}
        fast = t.fast_info

        def safe(val, default='N/A'):
            return val if val is not None else default

        def fmt_cap(val):
            if val is None:
                return 'N/A'
            if val >= 1e12:
                return f'${val/1e12:.2f}T'
            if val >= 1e9:
                return f'${val/1e9:.2f}B'
            if val >= 1e6:
                return f'${val/1e6:.2f}M'
            return f'${val:,.0f}'

        return jsonify({
            'ticker': ticker,
            'name': safe(info.get('longName') or info.get('shortName')),
            'sector': safe(info.get('sector')),
            'industry': safe(info.get('industry')),
            'market_cap': fmt_cap(info.get('marketCap') or getattr(fast, 'market_cap', None)),
            'pe_ratio': round(float(info['trailingPE']), 2) if info.get('trailingPE') else 'N/A',
            'fifty_two_week_high': round(float(getattr(fast, 'year_high', 0) or 0), 2),
            'fifty_two_week_low': round(float(getattr(fast, 'year_low', 0) or 0), 2),
            'dividend_yield': f"{round(float(info['dividendYield']) * 100, 2)}%" if info.get('dividendYield') else 'N/A',
            'description': (info.get('longBusinessSummary') or '')[:300]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/top-movers', methods=['GET'])
def top_movers():
    """Returns top 5 gainers & losers from a curated list."""
    symbols = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'META', 'GOOGL', 'NFLX', 'AMD', 'SPY', 
               'QQQ', 'DIA', 'BTC-USD', 'ETH-USD', 'COIN', 'PLTR', 'SNOW', 'CRWD', 'PANW', 'SMCI']
    results = []
    try:
        for sym in symbols:
            try:
                t = yf.Ticker(sym)
                info = t.fast_info
                current = float(info.last_price) if info.last_price else 0.0
                prev_close = float(info.previous_close) if info.previous_close else current
                if prev_close > 0:
                    change_pct = ((current - prev_close) / prev_close) * 100
                    results.append({
                        "symbol": sym,
                        "price": round(current, 2),
                        "change_percent": round(change_pct, 2)
                    })
            except Exception:
                continue
        # sort and get top gainers and losers
        results.sort(key=lambda x: x['change_percent'], reverse=True)
        return jsonify({
            "gainers": results[:5],
            "losers": results[-5:][::-1]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/news', methods=['GET'])
def news():
    """Returns latest headlines for a ticker, defaulting to general market if not provided."""
    ticker = request.args.get('ticker', 'SPY').upper()
    try:
        from sentiment import get_market_sentiment
        sentiment_data = get_market_sentiment(ticker)
        return jsonify(sentiment_data.get('news', []))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/technical-analysis', methods=['GET'])
def technical_analysis():
    """Returns Bollinger Bands, RSI, MACD, support/resistance for a ticker."""
    ticker = request.args.get('ticker', 'AAPL').upper()
    try:
        df = yf.download(ticker, period="6mo", progress=False)
        if df.empty:
            return jsonify({"error": "No data found"}), 404
            
        close = df['Close'].squeeze()
        
        # RSI
        delta = close.diff()
        gain = delta.clip(lower=0).rolling(14).mean()
        loss = (-delta.clip(upper=0)).rolling(14).mean()
        rs = gain / (loss + 1e-10)
        rsi = 100 - (100 / (1 + rs))
        
        # MACD
        ema12 = close.ewm(span=12, adjust=False).mean()
        ema26 = close.ewm(span=26, adjust=False).mean()
        macd = ema12 - ema26
        signal = macd.ewm(span=9, adjust=False).mean()
        hist = macd - signal
        
        # Bollinger Bands
        sma20 = close.rolling(20).mean()
        std20 = close.rolling(20).std()
        upper_bb = sma20 + (std20 * 2)
        lower_bb = sma20 - (std20 * 2)
        
        # Support/Resistance approx (min/max of last 3 months)
        recent = close.tail(60)
        support = recent.min()
        resistance = recent.max()
        
        return jsonify({
            "ticker": ticker,
            "rsi": round(float(rsi.iloc[-1]), 2),
            "macd": round(float(macd.iloc[-1]), 2),
            "macd_signal": round(float(signal.iloc[-1]), 2),
            "macd_hist": round(float(hist.iloc[-1]), 2),
            "bb_upper": round(float(upper_bb.iloc[-1]), 2),
            "bb_lower": round(float(lower_bb.iloc[-1]), 2),
            "bb_mid": round(float(sma20.iloc[-1]), 2),
            "support": round(float(support), 2),
            "resistance": round(float(resistance), 2),
            "current_price": round(float(close.iloc[-1]), 2)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/historical-range', methods=['GET'])
def historical_range():
    """Returns OHLCV data for custom date range."""
    ticker = request.args.get('ticker', 'AAPL').upper()
    start = request.args.get('start')
    end = request.args.get('end')
    period = request.args.get('period', '1mo')
    
    try:
        if start and end:
            df = yf.download(ticker, start=start, end=end, progress=False)
        else:
            df = yf.download(ticker, period=period, progress=False)
            
        if df.empty:
            return jsonify([])
            
        result = []
        for idx, row in df.iterrows():
            date_val = idx
            if isinstance(date_val, pd.Series):
                date_val = date_val.iloc[0]
                
            result.append({
                "date": pd.to_datetime(date_val).strftime('%Y-%m-%d'),
                "open": float(row['Open'].iloc[0]) if isinstance(row['Open'], pd.Series) else float(row['Open']),
                "high": float(row['High'].iloc[0]) if isinstance(row['High'], pd.Series) else float(row['High']),
                "low": float(row['Low'].iloc[0]) if isinstance(row['Low'], pd.Series) else float(row['Low']),
                "close": float(row['Close'].iloc[0]) if isinstance(row['Close'], pd.Series) else float(row['Close']),
                "volume": int(row['Volume'].iloc[0]) if isinstance(row['Volume'], pd.Series) else int(row['Volume'])
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/screener', methods=['GET'])
def screener():
    """Filters a curated stock list by basic metrics."""
    # List of 15 mega/large-cap stocks to quickly screen
    symbols = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'BRK-B', 'LLY', 'AVGO', 'JPM', 'TSLA', 'WMT', 'UNH', 'V', 'XOM']
    results = []
    try:
        for sym in symbols:
            try:
                t = yf.Ticker(sym)
                info = t.info or {}
                results.append({
                    "ticker": sym,
                    "name": info.get('shortName', sym),
                    "sector": info.get('sector', 'N/A'),
                    "price": round(float(info.get('currentPrice', 0)), 2) if info.get('currentPrice') else 0,
                    "pe": round(float(info.get('trailingPE', 0)), 2) if info.get('trailingPE') else None,
                    "marketCap": info.get('marketCap'),
                    "dividendYield": round(float(info.get('dividendYield', 0)) * 100, 2) if info.get('dividendYield') else 0
                })
            except Exception:
                continue
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/portfolio-prices', methods=['POST'])
def portfolio_prices():
    """Batch fetch current prices for a list of portfolio tickers. Identical to watchlist_prices."""
    return watchlist_prices()

import traceback

@app.route('/chat', methods=['POST'])
def chat():
    """Rule-based AI Analyst Chatbot"""
    data = request.get_json()
    message = data.get('message', '').lower()
    ticker = data.get('ticker', 'AAPL').upper()
    
    response = "I am NeuroChat, your AI financial analyst. "
    
    try:
        if 'rsi' in message or 'overbought' in message or 'oversold' in message:
            df = yf.download(ticker, period="3mo", progress=False)
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)
            close = df['Close']
            delta = close.diff()
            gain = delta.clip(lower=0).rolling(14).mean()
            loss = (-delta.clip(upper=0)).rolling(14).mean()
            rs = gain / (loss + 1e-10)
            rsi = 100 - (100 / (1 + rs))
            current_rsi = float(rsi.iloc[-1])
            
            status = "neutral"
            if current_rsi > 70:
                status = "overbought"
            elif current_rsi < 30:
                status = "oversold"
                
            response = f"The 14-day RSI for {ticker} is currently {current_rsi:.2f}. This indicates the stock is {status}."
            
        elif 'macd' in message or 'trend' in message:
            df = yf.download(ticker, period="3mo", progress=False)
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)
            close = df['Close']
            ema12 = close.ewm(span=12, adjust=False).mean()
            ema26 = close.ewm(span=26, adjust=False).mean()
            macd = ema12 - ema26
            signal = macd.ewm(span=9, adjust=False).mean()
            hist = macd - signal
            current_hist = float(hist.iloc[-1])
            
            trend = "bullish (upward momentum)" if current_hist > 0 else "bearish (downward momentum)"
            response = f"The MACD histogram for {ticker} is at {current_hist:.3f}, suggesting a {trend} trend."

        elif 'predict' in message or 'future' in message or 'tomorrow' in message:
            pred_data, err = get_prediction_data(ticker, 1)
            if err:
                response = f"I cannot predict {ticker} right now due to an error: {err}"
            else:
                tomorrow_pred = pred_data['predictions'][0]
                change = tomorrow_pred['change_percent']
                direction = "rise" if change > 0 else "fall"
                response = f"My neuro-network forecasts {ticker} will {direction} by {abs(change):.2f}%, reaching ${tomorrow_pred['price']:.2f} by {tomorrow_pred['date']}."
                
        elif 'price' in message or 'current' in message:
            t_obj = yf.Ticker(ticker)
            price = t_obj.fast_info.last_price
            response = f"The current price of {ticker} is ${price:.2f}."
            
        elif 'sentiment' in message or 'news' in message or 'feel' in message:
            from sentiment import get_market_sentiment
            sent = get_market_sentiment(ticker)
            response = f"The market sentiment for {ticker} is '{sent['label']}' with a score of {sent['score']}/100. Recent headlines suggest {sent['trend']} momentum."
            
        elif 'hello' in message or 'hi ' in message or 'hey' in message:
             response = f"Hello! I am NeuroChat. I can analyze RSI, MACD, predict future prices, or check market sentiment. Ask me something like 'What is the RSI of {ticker}?'"
             
        else:
            response = f"I'm specialized in technical analysis for {ticker}. Try asking about its 'RSI', 'MACD', 'predictions', or 'sentiment'."
            
    except Exception as e:
        response = f"My neural pathways encountered an error analyzing {ticker}: {str(e)}"
        
    return jsonify({"response": response})

@app.route('/backtest-strategy', methods=['POST'])
def backtest_strategy():
    data = request.get_json()
    ticker = data.get('ticker', 'AAPL').upper()
    buy_rules = data.get('buy_rules', [])
    sell_rules = data.get('sell_rules', [])
    initial_capital = float(data.get('initial_capital', 10000))
    
    try:
        df = yf.download(ticker, period="1y", progress=False)
        if df.empty:
             return jsonify({"error": "No data found for backtesting."}), 404
             
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
            
        close = df['Close']
        
        delta = close.diff()
        gain = delta.clip(lower=0).rolling(14).mean()
        loss = (-delta.clip(upper=0)).rolling(14).mean()
        rs = gain / (loss + 1e-10)
        df['RSI'] = 100 - (100 / (1 + rs))
        
        ema12 = close.ewm(span=12, adjust=False).mean()
        ema26 = close.ewm(span=26, adjust=False).mean()
        macd = ema12 - ema26
        signal = macd.ewm(span=9, adjust=False).mean()
        df['MACD'] = macd - signal
        
        df['SMA20'] = close.rolling(20).mean()
        df['SMA50'] = close.rolling(50).mean()
        
        cash = initial_capital
        shares = 0
        trades = []
        portfolio_timeline = []
        
        def evaluate_rules(row_data, rules):
            if not rules: return False
            for r in rules:
                val = float(r['val'])
                indic = r['col']
                if indic not in row_data: return False
                current_val = float(row_data[indic])
                if r['op'] == '<' and not (current_val < val): return False
                if r['op'] == '>' and not (current_val > val): return False
            return True

        for date, row in df.iterrows():
            if pd.isna(row['RSI']):
                portfolio_timeline.append({'date': date.strftime("%Y-%m-%d"), 'value': cash})
                continue
                
            price = float(row['Close'])
            
            # Check Sell
            if shares > 0 and evaluate_rules(row, sell_rules):
                cash += shares * price
                trades.append({
                    "type": "SELL", 
                    "date": date.strftime("%Y-%m-%d"), 
                    "price": round(price, 2), 
                    "shares": round(shares, 4),
                    "value": round(shares * price, 2)
                })
                shares = 0
                
            # Check Buy (only if not holding)
            elif shares == 0 and evaluate_rules(row, buy_rules):
                shares_bought = cash / price
                shares = shares_bought
                trades.append({
                    "type": "BUY", 
                    "date": date.strftime("%Y-%m-%d"), 
                    "price": round(price, 2), 
                    "shares": round(shares, 4),
                    "value": round(cash, 2)
                })
                cash = 0
                
            current_val = cash + (shares * price)
            portfolio_timeline.append({'date': date.strftime("%Y-%m-%d"), 'value': round(current_val, 2)})
            
        # force final sell if holding to calculate accurate final value
        final_value = cash
        if shares > 0:
            final_price = float(df['Close'].iloc[-1])
            final_value += shares * final_price
            
        roi = ((final_value - initial_capital) / initial_capital) * 100
        
        return jsonify({
            "ticker": ticker,
            "initial": initial_capital,
            "final": round(final_value, 2),
            "roi": round(roi, 2),
            "trades": trades,
            "timeline": portfolio_timeline,
            "total_trades": len(trades)
        })
        
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
