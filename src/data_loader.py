"""
Data Loader Module
Fetches historical stock data using yfinance API
"""

import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta


def fetch_stock_data(ticker: str, period: str = "5y", interval: str = "1d") -> pd.DataFrame:
    """
    Fetch historical stock data for a given ticker symbol.
    
    Args:
        ticker (str): Stock ticker symbol (e.g., 'AAPL', 'GOOGL')
        period (str): Time period to fetch. Options: '1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max'
        interval (str): Data interval. Options: '1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo'
    
    Returns:
        pd.DataFrame: DataFrame with columns ['Open', 'High', 'Low', 'Close', 'Volume']
    """
    print(f"📊 Fetching data for {ticker}...")
    
    try:
        # Method 1: Try using yf.download (more reliable)
        df = yf.download(ticker, period=period, interval=interval, progress=False)
        
        # If empty, try alternative method
        if df.empty:
            print("⚠️ First method failed, trying alternative...")
            stock = yf.Ticker(ticker)
            df = stock.history(period=period, interval=interval)
        
        if df.empty:
            # Try with a shorter period as fallback
            print("⚠️ Trying with shorter period (1y)...")
            df = yf.download(ticker, period="1y", interval=interval, progress=False)
        
        if df.empty:
            raise ValueError(f"No data found for ticker: {ticker}. Please check:\n"
                           f"  1. Ticker symbol is correct\n"
                           f"  2. You have internet connection\n"
                           f"  3. Yahoo Finance is accessible")
        
        # Reset index to make Date a column
        df.reset_index(inplace=True)
        
        # Rename 'Date' or 'Datetime' column to 'Date'
        if 'Datetime' in df.columns:
            df.rename(columns={'Datetime': 'Date'}, inplace=True)
        
        print(f"✅ Successfully fetched {len(df)} records")
        print(f"📅 Date range: {df['Date'].min()} to {df['Date'].max()}")
        
        return df
    
    except Exception as e:
        print(f"❌ Error fetching data: {str(e)}")
        print(f"\n💡 Troubleshooting tips:")
        print(f"   - Check your internet connection")
        print(f"   - Verify ticker symbol is correct")
        print(f"   - Try updating yfinance: pip install yfinance --upgrade")
        raise


def fetch_stock_data_by_dates(ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
    """
    Fetch historical stock data for a given ticker symbol between specific dates.
    
    Args:
        ticker (str): Stock ticker symbol (e.g., 'AAPL', 'GOOGL')
        start_date (str): Start date in 'YYYY-MM-DD' format
        end_date (str): End date in 'YYYY-MM-DD' format
    
    Returns:
        pd.DataFrame: DataFrame with columns ['Open', 'High', 'Low', 'Close', 'Volume']
    """
    print(f"📊 Fetching data for {ticker} from {start_date} to {end_date}...")
    
    try:
        stock = yf.Ticker(ticker)
        df = stock.history(start=start_date, end=end_date)
        
        if df.empty:
            raise ValueError(f"No data found for ticker: {ticker}")
        
        # Reset index to make Date a column
        df.reset_index(inplace=True)
        
        print(f"✅ Successfully fetched {len(df)} records")
        
        return df
    
    except Exception as e:
        print(f"❌ Error fetching data: {str(e)}")
        raise


def get_latest_price(ticker: str) -> float:
    """
    Get the latest closing price for a stock.
    
    Args:
        ticker (str): Stock ticker symbol
    
    Returns:
        float: Latest closing price
    """
    try:
        stock = yf.Ticker(ticker)
        data = stock.history(period="1d")
        return data['Close'].iloc[-1]
    except Exception as e:
        print(f"❌ Error getting latest price: {str(e)}")
        raise


if __name__ == "__main__":
    # Test the data loader
    ticker = "AAPL"
    df = fetch_stock_data(ticker, period="1y")
    print("\n📈 Sample data:")
    print(df.head())
    print(f"\n📊 Data shape: {df.shape}")
    print(f"\n💰 Latest price: ${get_latest_price(ticker):.2f}")
