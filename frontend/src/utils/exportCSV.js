/**
 * Export prediction data to CSV file
 * @param {Object} data - Prediction data object
 * @param {string} ticker - Stock ticker symbol
 */
export const exportPredictionsToCSV = (data, ticker) => {
    if (!data || !data.predictions) {
        console.error('No prediction data to export');
        return;
    }

    // Prepare CSV headers
    const headers = ['Date', 'Predicted Price', 'Change %', 'Current Price'];

    // Prepare CSV rows
    const rows = data.predictions.map(pred => [
        pred.date,
        pred.price.toFixed(2),
        pred.change_percent.toFixed(2),
        data.current_price.toFixed(2)
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${ticker}_predictions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Export historical data to CSV file
 * @param {Array} historical - Historical data array
 * @param {string} ticker - Stock ticker symbol
 */
export const exportHistoricalToCSV = (historical, ticker) => {
    if (!historical || historical.length === 0) {
        console.error('No historical data to export');
        return;
    }

    // Prepare CSV headers
    const headers = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume'];

    // Prepare CSV rows
    const rows = historical.map(item => [
        item.date,
        item.open.toFixed(2),
        item.high.toFixed(2),
        item.low.toFixed(2),
        item.close.toFixed(2),
        item.volume
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${ticker}_historical_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
