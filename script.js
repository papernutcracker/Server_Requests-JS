// 1
function fetchAdviceByKeyword(keyword) {
    let out = document.getElementById('advice-out');

    if (!keyword || !keyword.trim()) {
        out.innerHTML = "<p>Please enter a word.</p>";
        return;
    }

    out.innerHTML = "<p>Searching...</p>";

    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.adviceslip.com/advice/search/' + keyword.trim());

    xhr.onload = function() {
        if (xhr.status === 200) {
            let res = JSON.parse(xhr.responseText);
            if (res.slips && res.slips.length > 0) {
                out.innerHTML = '';
                for (let i = 0; i < res.slips.length; i++) {
                    out.innerHTML += `<p>💡 ${res.slips[i].advice}</p>`;
                }
            } else {
                out.innerHTML = "<p>No advice found for this word.</p>";
            }
        } else {
            out.innerHTML = "<p>Server error.</p>";
        }
    };
    
    xhr.onerror = function() {
        out.innerHTML = "<p>Network error.</p>";
    };
    
    xhr.send();
}

// 2
function fetchDogBreeds() {
    let ul = document.getElementById('breed-list');
    ul.innerHTML = "<li>Loading...</li>";

    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://dog.ceo/api/breeds/list/all');

    xhr.onload = function() {
        if (xhr.status === 200) {
            let res = JSON.parse(xhr.responseText);
            ul.innerHTML = "";
            for (let breed in res.message) {
                let li = document.createElement('li');
                li.textContent = breed;
                ul.appendChild(li);
            }
        } else {
            console.error("Server error:", xhr.status);
        }
    };
    
    xhr.onerror = function() {
        console.error("Network error loading breeds");
    };
    
    xhr.send();
}

// 3
function fetchRandomQuote() {
    let out = document.getElementById('quote-container');
    out.innerHTML = "Loading...";

    // ключ від api-ninjas.com — вставте його сюди
    let apiKey = 'YOUR_API_KEY'; 

    fetch('https://api.api-ninjas.com/v1/quotes', {
        method: 'GET',
        headers: {
            'X-Api-Key': apiKey
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        if (data && data.length > 0) {
            let quote = data[0].quote;
            let author = data[0].author;

            out.innerHTML = `
                <p>"${quote}"</p>
                <p><b>- ${author}</b></p>
            `;
        }
    })
    .catch(err => {
        console.error("Error fetching quote from API-Ninjas:", err.message);

        fetch('https://dummyjson.com/quotes/random')
            .then(res => res.json())
            .then(backupData => {
                out.innerHTML = `
                    <p>"${backupData.quote}"</p>
                    <p><b>- ${backupData.author}</b></p>
                `;
            })
            .catch(backupErr => {
                console.error("Backup API error:", backupErr);
            });
    });
}

// 4
function fetchCountryByName(countryName) {
    let btn = document.getElementById('reg-btn');
    let out = document.getElementById('country-info');
    let form = document.getElementById('country-form');

    btn.disabled = true;
    btn.textContent = "Loading...";
    out.innerHTML = "";

    let query = countryName.trim().toLowerCase();

    // Спочатку звертаємось за адресою, а якщо сервер v3.1 вимкнений — беремо офіційну базу з GitHub
    fetch('https://restcountries.com/v3.1/name/' + encodeURIComponent(query))
    .then(res => {
        if (!res.ok) throw new Error("Fallback to mirror");
        return res.json();
    })
    .then(data => {
        if (!Array.isArray(data)) throw new Error("Fallback to mirror");
        return data[0];
    })
    .catch(() => {
        // Резервне завантаження повної бази країн напряму з GitHub (працює завжди і для всіх країн світу)
        return fetch('https://raw.githubusercontent.com/mledoze/countries/master/countries.json')
            .then(res => res.json())
            .then(allCountries => {
                let found = allCountries.find(c => 
                    c.name.common.toLowerCase() === query ||
                    c.name.official.toLowerCase() === query ||
                    (c.cca3 && c.cca3.toLowerCase() === query) ||
                    (c.cca2 && c.cca2.toLowerCase() === query) ||
                    (c.altSpellings && c.altSpellings.some(s => s.toLowerCase() === query)) ||
                    c.name.common.toLowerCase().includes(query)
                );
                
                if (!found) throw new Error("Country not found");
                return found;
            });
    })
    .then(c => {
        let code = (c.cca2 || 'ua').toLowerCase();
        let flagUrl = (c.flags && c.flags.svg) ? c.flags.svg : `https://flagcdn.com/${code}.svg`;
        let capital = (c.capital && c.capital.length > 0) ? c.capital[0] : 'None';
        let population = c.population ? c.population.toLocaleString() : 'N/A';

        out.innerHTML = `
            <h3>${c.name.common}</h3>
            <p><strong>Capital:</strong> ${capital}</p>
            <p><strong>Region:</strong> ${c.region}</p>
            <p><strong>Population:</strong> ${population}</p>
            <img src="${flagUrl}" width="150" style="border:1px solid #ccc; margin-top:5px;">
        `;
        form.reset();
    })
    .catch(err => {
        out.innerHTML = `<p style="color:red;">${err.message}</p>`;
    })
    .finally(() => {
        btn.disabled = false;
        btn.textContent = "Search / Register";
    });
}

document.getElementById('country-form').addEventListener('submit', function(e) {
    e.preventDefault(); 
    let name = document.getElementById('countryName').value;
    if (name.trim()) {
        fetchCountryByName(name);
    }
});