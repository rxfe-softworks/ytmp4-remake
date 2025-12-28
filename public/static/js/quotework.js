const file = '/static/js/quotes.txt';

async function fetchQuotes() {
    try {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.text();
        return data.split('\n').filter(quote => quote.trim() !== '');
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        return [];
    }
}