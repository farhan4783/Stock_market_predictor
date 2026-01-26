"""
Training Pipeline
Trains the LSTM model on historical stock data
"""

import os
import sys
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime

# Add src to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from data_loader import fetch_stock_data
from preprocessing import add_technical_indicators, prepare_data, split_data
from model import create_lstm_model, get_callbacks


def plot_training_history(history, save_path: str = "models/training_history.png"):
    """
    Plot and save training history.
    
    Args:
        history: Keras training history object
        save_path (str): Path to save the plot
    """
    plt.figure(figsize=(14, 5))
    
    # Plot loss
    plt.subplot(1, 2, 1)
    plt.plot(history.history['loss'], label='Training Loss', linewidth=2)
    plt.plot(history.history['val_loss'], label='Validation Loss', linewidth=2)
    plt.title('Model Loss', fontsize=14, fontweight='bold')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # Plot MAE
    plt.subplot(1, 2, 2)
    plt.plot(history.history['mean_absolute_error'], label='Training MAE', linewidth=2)
    plt.plot(history.history['val_mean_absolute_error'], label='Validation MAE', linewidth=2)
    plt.title('Mean Absolute Error', fontsize=14, fontweight='bold')
    plt.xlabel('Epoch')
    plt.ylabel('MAE')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"✅ Training history saved to {save_path}")
    plt.close()


def train_model(ticker: str = "AAPL", period: str = "5y", 
                sequence_length: int = 60, epochs: int = 50, 
                batch_size: int = 32, validation_split: float = 0.1):
    """
    Complete training pipeline for stock price prediction.
    
    Args:
        ticker (str): Stock ticker symbol
        period (str): Time period for historical data
        sequence_length (int): Number of days to look back
        epochs (int): Number of training epochs
        batch_size (int): Batch size for training
        validation_split (float): Validation data ratio
    """
    print("=" * 70)
    print(f"🚀 STOCK MARKET PREDICTOR - TRAINING PIPELINE")
    print("=" * 70)
    print(f"📊 Ticker: {ticker}")
    print(f"📅 Period: {period}")
    print(f"🔢 Sequence Length: {sequence_length}")
    print(f"🎯 Epochs: {epochs}")
    print("=" * 70)
    
    # Step 1: Fetch data
    print("\n[1/5] 📥 Fetching stock data...")
    df = fetch_stock_data(ticker, period=period)
    
    # Step 2: Add technical indicators
    print("\n[2/5] 🔧 Adding technical indicators...")
    df = add_technical_indicators(df)
    
    # Step 3: Prepare data
    print("\n[3/5] 🎲 Preparing data for LSTM...")
    X, y, scaler = prepare_data(df, sequence_length=sequence_length)
    X_train, X_test, y_train, y_test = split_data(X, y, train_ratio=0.8)
    
    # Step 4: Create model
    print("\n[4/5] 🧠 Creating LSTM model...")
    input_shape = (X_train.shape[1], X_train.shape[2])
    model = create_lstm_model(input_shape, units=[100, 50, 50], dropout_rate=0.2)
    
    # Step 5: Train model
    print("\n[5/5] 🏋️ Training model...")
    callbacks = get_callbacks(model_path=f"models/{ticker}_best_model.h5")
    
    history = model.fit(
        X_train, y_train,
        epochs=epochs,
        batch_size=batch_size,
        validation_split=validation_split,
        callbacks=callbacks,
        verbose=1
    )
    
    # Evaluate on test set
    print("\n📊 Evaluating on test set...")
    test_loss, test_mae = model.evaluate(X_test, y_test, verbose=0)
    print(f"✅ Test Loss: {test_loss:.6f}")
    print(f"✅ Test MAE: {test_mae:.6f}")
    
    # Plot training history
    plot_training_history(history, save_path=f"models/{ticker}_training_history.png")
    
    # Save scaler
    import joblib
    scaler_path = f"models/{ticker}_scaler.pkl"
    joblib.dump(scaler, scaler_path)
    print(f"✅ Scaler saved to {scaler_path}")
    
    # Save metadata
    metadata = {
        'ticker': ticker,
        'period': period,
        'sequence_length': sequence_length,
        'num_features': X_train.shape[2],
        'test_loss': float(test_loss),
        'test_mae': float(test_mae),
        'trained_on': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    import json
    metadata_path = f"models/{ticker}_metadata.json"
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=4)
    print(f"✅ Metadata saved to {metadata_path}")
    
    print("\n" + "=" * 70)
    print("🎉 TRAINING COMPLETE!")
    print("=" * 70)
    print(f"📁 Model saved: models/{ticker}_best_model.h5")
    print(f"📁 Scaler saved: {scaler_path}")
    print(f"📁 Metadata saved: {metadata_path}")
    print(f"📁 Training plot: models/{ticker}_training_history.png")
    print("=" * 70)


if __name__ == "__main__":
    # Train on Apple stock
    train_model(
        ticker="AAPL",
        period="5y",
        sequence_length=60,
        epochs=50,
        batch_size=32
    )
