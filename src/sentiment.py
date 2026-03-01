"""
Sentiment Analysis Module
Provides market sentiment analysis using a mock engine (simulated data).
In a production environment, this would connect to NewsAPI or similar.
"""

import random
from datetime import datetime, timedelta
import yfinance as yf

def get_market_sentiment(ticker: str) -> dict:
    """
    Get market sentiment for a specific ticker.
    Also computes RSI and trend direction from live yfinance data.

    Args:
        ticker (str): Stock ticker symbol

    Returns:
        dict: Sentiment data including score, label, news headlines, RSI, and trend.
    """
    # Deterministic seed based on ticker and date to keep it consistent for the day
    date_str = datetime.now().strftime("%Y%m%d")
    seed_val = sum(ord(c) for c in ticker) + int(date_str)
    random.seed(seed_val)

    # Generate a sentiment score between -100 (Extreme Fear) and 100 (Extreme Greed)
    base_score = random.randint(-40, 60)
    score = max(-100, min(100, base_score + random.randint(-10, 10)))

    # Determine label
    if score >= 75:
        label = "Extreme Greed"
        color = "green"
    elif score >= 25:
        label = "Greed"
        color = "lightgreen"
    elif score >= -25:
        label = "Neutral"
        color = "gray"
    elif score >= -75:
        label = "Fear"
        color = "orange"
    else:
        label = "Extreme Fear"
        color = "red"

    # Generate mock news
    templates = [
        f"Analysts upgrade {ticker} following strong earnings report",
        f"{ticker} announces new AI initiative",
        f"Market uncertainty affects {ticker} stock price",
        f"{ticker} CEO to speak at upcoming tech conference",
        f"Investors watching {ticker} closely this week",
        f"Why {ticker} could be the next big mover",
        f"{ticker} faces regulatory scrutiny in EU",
        f"Tech sector rally boosts {ticker}",
        f"Supply chain issues may impact {ticker} growth",
        f"{ticker} launches new product line"
    ]

    news = []
    headlines = random.sample(templates, 3)
    for headline in headlines:
        news.append({
            "title": headline,
            "source": random.choice(["TechDaily", "MarketWatch", "Bloomberg", "Reuters", "CNBC"]),
            "time": f"{random.randint(1, 23)}h ago",
            "url": "#"
        })

    # Compute live RSI and trend from yfinance
    rsi = None
    trend = "neutral"
    try:
        df = yf.download(ticker, period="3mo", interval="1d", progress=False, auto_adjust=True)
        if len(df) >= 15:
            close = df["Close"].squeeze()
            delta = close.diff()
            gain = delta.clip(lower=0).rolling(14).mean()
            loss = (-delta.clip(upper=0)).rolling(14).mean()
            rs = gain / (loss + 1e-10)
            rsi_series = 100 - (100 / (1 + rs))
            rsi = round(float(rsi_series.iloc[-1]), 1)

            # Simple trend: last close vs 20-day SMA
            sma20 = close.rolling(20).mean().iloc[-1]
            last_close = float(close.iloc[-1])
            if last_close > float(sma20) * 1.005:
                trend = "bullish"
            elif last_close < float(sma20) * 0.995:
                trend = "bearish"
            else:
                trend = "neutral"
    except Exception:
        pass

    return {
        "ticker": ticker,
        "score": score,
        "label": label,
        "color": color,
        "news": news,
        "rsi": rsi,
        "trend": trend,
        "summary": f"Market sentiment for {ticker} is currently showing {label.lower()}. Analysts are mixed but long-term indicators remain robust."
    }

if __name__ == "__main__":
    print(get_market_sentiment("AAPL"))
