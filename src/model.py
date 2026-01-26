"""
LSTM Model Architecture
Defines the neural network model for stock price prediction
"""

try:
    # Try TensorFlow 2.x imports first
    from tensorflow import keras
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
except (ImportError, AttributeError):
    # Fallback to standalone Keras
    import keras
    from keras.models import Sequential
    from keras.layers import LSTM, Dense, Dropout
    from keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau

import os


def create_lstm_model(input_shape: tuple, units: list = None, dropout_rate: float = 0.2) -> Sequential:
    """
    Create an LSTM model for stock price prediction.
    
    Args:
        input_shape (tuple): Shape of input data (sequence_length, num_features)
        units (list): List of LSTM units for each layer (default: [50, 50, 50])
        dropout_rate (float): Dropout rate for regularization
    
    Returns:
        Sequential: Compiled Keras model
    """
    if units is None:
        units = [50, 50, 50]
    
    model = Sequential()
    
    # First LSTM layer with return sequences
    model.add(LSTM(units=units[0], return_sequences=True, input_shape=input_shape))
    model.add(Dropout(dropout_rate))
    
    # Second LSTM layer
    if len(units) > 1:
        model.add(LSTM(units=units[1], return_sequences=len(units) > 2))
        model.add(Dropout(dropout_rate))
    
    # Third LSTM layer (if specified)
    if len(units) > 2:
        model.add(LSTM(units=units[2], return_sequences=False))
        model.add(Dropout(dropout_rate))
    
    # Dense output layer
    model.add(Dense(units=25))
    model.add(Dense(units=1))
    
    # Compile the model
    model.compile(
        optimizer='adam',
        loss='mean_squared_error',
        metrics=['mean_absolute_error']
    )
    
    print("✅ Model created successfully!")
    print(f"📊 Model architecture:")
    model.summary()
    
    return model


def get_callbacks(model_path: str = "models/best_model.h5") -> list:
    """
    Get training callbacks for the model.
    
    Args:
        model_path (str): Path to save the best model
    
    Returns:
        list: List of Keras callbacks
    """
    # Create models directory if it doesn't exist
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    
    callbacks = [
        # Save the best model
        ModelCheckpoint(
            filepath=model_path,
            monitor='val_loss',
            save_best_only=True,
            mode='min',
            verbose=1
        ),
        
        # Early stopping to prevent overfitting
        EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        
        # Reduce learning rate when plateau
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=0.00001,
            verbose=1
        )
    ]
    
    return callbacks


def load_trained_model(model_path: str = "models/best_model.h5") -> Sequential:
    """
    Load a trained model from disk.
    
    Args:
        model_path (str): Path to the saved model
    
    Returns:
        Sequential: Loaded Keras model
    """
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}")
    
    model = keras.models.load_model(model_path)
    print(f"✅ Model loaded from {model_path}")
    
    return model


if __name__ == "__main__":
    # Test model creation
    input_shape = (60, 9)  # 60 time steps, 9 features
    model = create_lstm_model(input_shape)
    
    print(f"\n📊 Total parameters: {model.count_params():,}")
