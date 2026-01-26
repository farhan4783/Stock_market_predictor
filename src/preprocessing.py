"""
Preprocessing Module
Handles data cleaning, feature engineering, and preparation for LSTM model
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from typing import Tuple


def add_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add technical indicators to the dataframe.
    
    Indicators added:
    - SMA (Simple Moving Average) - 20 and 50 days
    - EMA (Exponential Moving Average) - 12 and 26 days
    - RSI (Relative Strength Index)
    - MACD (Moving Average Convergence Divergence)
    
    Args:
        df (pd.DataFrame): DataFrame with stock data
    
    Returns:
        pd.DataFrame: DataFrame with added technical indicators
    """
    df = df.copy()
    
    # Simple Moving Averages
    df['SMA_20'] = df['Close'].rolling(window=20).mean()
    df['SMA_50'] = df['Close'].rolling(window=50).mean()
    
    # Exponential Moving Averages
    df['EMA_12'] = df['Close'].ewm(span=12, adjust=False).mean()
    df['EMA_26'] = df['Close'].ewm(span=26, adjust=False).mean()
    
    # RSI (Relative Strength Index)
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))
    
    # MACD
    df['MACD'] = df['EMA_12'] - df['EMA_26']
    df['MACD_Signal'] = df['MACD'].ewm(span=9, adjust=False).mean()
    df['MACD_Hist'] = df['MACD'] - df['MACD_Signal']
    
    # Drop NaN values created by rolling windows
    df.dropna(inplace=True)
    
    print(f"✅ Added technical indicators. Remaining records: {len(df)}")
    
    return df


def prepare_data(df: pd.DataFrame, sequence_length: int = 60, 
                 feature_columns: list = None) -> Tuple[np.ndarray, np.ndarray, MinMaxScaler]:
    """
    Prepare data for LSTM model by creating sequences and normalizing.
    
    Args:
        df (pd.DataFrame): DataFrame with stock data and technical indicators
        sequence_length (int): Number of time steps to use for prediction
        feature_columns (list): List of column names to use as features
    
    Returns:
        Tuple containing:
        - X (np.ndarray): Input sequences of shape (samples, sequence_length, features)
        - y (np.ndarray): Target values (next day's closing price)
        - scaler (MinMaxScaler): Fitted scaler for inverse transformation
    """
    if feature_columns is None:
        feature_columns = ['Close', 'Volume', 'SMA_20', 'SMA_50', 'EMA_12', 
                          'EMA_26', 'RSI', 'MACD', 'MACD_Signal']
    
    # Select only the feature columns
    data = df[feature_columns].values
    
    # Normalize the data
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data)
    
    # Create sequences
    X, y = [], []
    
    for i in range(sequence_length, len(scaled_data)):
        X.append(scaled_data[i-sequence_length:i])
        # Target is the next day's closing price (index 0 is 'Close')
        y.append(scaled_data[i, 0])
    
    X = np.array(X)
    y = np.array(y)
    
    print(f"✅ Prepared data - X shape: {X.shape}, y shape: {y.shape}")
    
    return X, y, scaler


def split_data(X: np.ndarray, y: np.ndarray, 
               train_ratio: float = 0.8) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Split data into training and testing sets.
    
    Args:
        X (np.ndarray): Input sequences
        y (np.ndarray): Target values
        train_ratio (float): Ratio of training data (default: 0.8)
    
    Returns:
        Tuple containing X_train, X_test, y_train, y_test
    """
    split_idx = int(len(X) * train_ratio)
    
    X_train = X[:split_idx]
    X_test = X[split_idx:]
    y_train = y[:split_idx]
    y_test = y[split_idx:]
    
    print(f"✅ Split data - Train: {len(X_train)}, Test: {len(X_test)}")
    
    return X_train, X_test, y_train, y_test


def inverse_transform_predictions(predictions: np.ndarray, scaler: MinMaxScaler, 
                                  num_features: int) -> np.ndarray:
    """
    Inverse transform predictions back to original scale.
    
    Args:
        predictions (np.ndarray): Normalized predictions
        scaler (MinMaxScaler): Fitted scaler
        num_features (int): Number of features used in scaling
    
    Returns:
        np.ndarray: Predictions in original scale
    """
    # Create a dummy array with the same number of features
    dummy = np.zeros((len(predictions), num_features))
    dummy[:, 0] = predictions.flatten()
    
    # Inverse transform
    inverse = scaler.inverse_transform(dummy)
    
    return inverse[:, 0]


if __name__ == "__main__":
    # Test preprocessing
    from data_loader import fetch_stock_data
    
    df = fetch_stock_data("AAPL", period="2y")
    df = add_technical_indicators(df)
    
    print("\n📊 Data with indicators:")
    print(df.head())
    
    X, y, scaler = prepare_data(df, sequence_length=60)
    X_train, X_test, y_train, y_test = split_data(X, y)
    
    print(f"\n✅ Preprocessing complete!")
