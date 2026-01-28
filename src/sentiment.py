"""
Sentiment Analysis Module
Provides market sentiment analysis using a mock engine (simulated data).
In a production environment, this would connect to NewsAPI or similar.
"""

import random
from datetime import datetime, timedelta

def get_market_sentiment(ticker: str) -> dict:
    """
    Get market sentiment for a specific ticker.
    Currently returns simulated data for demonstration purposes.
    
    Args:
        ticker (str): Stock ticker symbol
        
    Returns:
        dict: Sentiment data including score, label, and news headlines
    """
    # Deterministic seed based on ticker and date to keep it consistent for the day
    date_str = datetime.now().strftime("%Y%m%d")
    seed_val = sum(ord(c) for c in ticker) + int(date_str)
    random.seed(seed_val)
    
    # Generate a sentiment score between -100 (Extreme Fear) and 100 (Extreme Greed)
    # Bias slightly positive for tech stocks often
    base_score = random.randint(-40, 60)
    
    # Add some randomness
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
    # Select 3 random unique headlines
    headlines = random.sample(templates, 3)
    
    for headline in headlines:
        news.append({
            "title": headline,
            "source": random.choice(["TechDaily", "MarketWatch", "Bloomberg", "Reuters", "CNBC"]),
            "time": f"{random.randint(1, 23)}h ago",
            "url": "#"
        })
        
    return {
        "ticker": ticker,
        "score": score,
        "label": label,
        "color": color,
        "news": news,
        "summary": f"Market sentiment for {ticker} is currently showing {label.lower()}. Analysts are mixed but long-term indicators remain robust."
    }

if __name__ == "__main__":
    print(get_market_sentiment("AAPL"))
