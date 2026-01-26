# Models Directory

This directory contains trained models and their artifacts:

- `{TICKER}_best_model.h5` - Trained LSTM model
- `{TICKER}_scaler.pkl` - MinMaxScaler for data normalization
- `{TICKER}_metadata.json` - Model training metadata
- `{TICKER}_training_history.png` - Training loss/MAE visualization
- `{TICKER}_prediction.png` - Prediction visualization

## Note

Model files are excluded from git (see `.gitignore`). You need to train the model first using:

```bash
python src/train.py
```
