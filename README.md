# Stock Market Predictor 📈

A highly effective stock market prediction system using LSTM (Long Short-Term Memory) neural networks to forecast future stock prices based on historical data and technical indicators.

## Features

- **Historical Data Fetching**: Automatically downloads stock data using `yfinance`
- **Technical Indicators**: Includes SMA, EMA, RSI, and MACD for enhanced predictions
- **LSTM Model**: Deep learning architecture optimized for time-series forecasting
- **Visualization**: Beautiful charts showing actual vs predicted prices
- **Modular Design**: Easy to train on different stocks and timeframes

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Training the Model
```bash
python src/train.py
```

### Making Predictions
```bash
python src/predict.py
```

## Project Structure

```
stock_market prediction/
├── src/
│   ├── data_loader.py      # Fetch historical stock data
│   ├── preprocessing.py    # Data cleaning and feature engineering
│   ├── model.py           # LSTM model architecture
│   ├── train.py           # Training pipeline
│   └── predict.py         # Prediction and visualization
├── models/                # Saved trained models
├── requirements.txt       # Project dependencies
└── README.md             # This file
```

## Technical Details

- **Model**: LSTM with dropout layers for regularization
- **Features**: Close price, SMA (20, 50), EMA (12, 26), RSI, MACD
- **Sequence Length**: 60 days of historical data
- **Normalization**: MinMaxScaler for feature scaling

## Note

⚠️ **Disclaimer**: This is a predictive model for educational purposes. Stock market predictions are inherently uncertain and should not be used as the sole basis for investment decisions.
