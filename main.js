const i18next = window.i18next;
const i18nextHttpBackend = window.i18nextHttpBackend;

i18next
    .use(i18nextHttpBackend)
    .init({
        lng: localStorage.getItem('lang') || 'en', // Default language set to English
        fallbackLng: 'en',
        debug: true,
        load: 'currentOnly', // Prevent loading language-only file like 'zh' from 'zh-CN'
        backend: {
            loadPath: '/locales/{{lng}}/translation.json',
        },
    }, (err, t) => {
        if (err) return console.error(err);
        
        // The DOM is ready since the script is at the end of the body, and i18next is initialized.
        // We can now safely set up event listeners and update the UI.
        setupLanguageSwitcher();
        updateContent();
        updatePasswords();
        updateLangSwitcherUI();

        // Add interaction for other cards
        document.querySelectorAll('.feature-card, .wiki-category').forEach(card => {
            card.addEventListener('click', function() {
                this.style.backgroundColor = 'rgba(52, 152, 219, 0.3)';
                setTimeout(() => {
                    this.style.backgroundColor = '';
                }, 300);
            });
        });
    });

function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const options = JSON.parse(element.getAttribute('data-i18n-options') || '{}');
        // Use innerHTML for elements that might contain other HTML tags (like the title)
        // Use textContent for others to be safer against XSS.
        // For simplicity here, we'll use innerHTML as we control the translations.
        element.innerHTML = i18next.t(key, options);
    });
    // Also update meta tags that don't have the attribute
    const titleTag = document.querySelector('title');
    if(titleTag) titleTag.textContent = i18next.t('site_title');

    const descriptionMeta = document.querySelector('meta[name="description"]');
    if(descriptionMeta) descriptionMeta.setAttribute('content', i18next.t('site_description'));
    
    const hotFeaturesTitle = document.querySelector('.card-title span[data-i18n="hot_features.title"]');
    if(hotFeaturesTitle) {
        const currentLang = i18next.language;
        if (currentLang.startsWith('zh')) {
             hotFeaturesTitle.textContent = i18next.t('home.loot_links_title');
        } else {
             hotFeaturesTitle.textContent = i18next.t('hot_features.title');
        }
    }
}

function changeLanguage(lang, event) {
    if (event) event.preventDefault();
    i18next.changeLanguage(lang, (err, t) => {
        if (err) return console.error(err);
        localStorage.setItem('lang', lang);
        document.documentElement.lang = i18next.language.startsWith('zh') ? 'zh-CN' : i18next.language;
        updateContent();
        updatePasswords(); // Re-run password update to apply date format
        updateLangSwitcherUI();
        const switcher = document.querySelector('.lang-switcher');
        if (switcher) {
            switcher.classList.remove('show');
        }
    });
}

function updateLangSwitcherUI() {
    const langMap = {
        'zh-CN': '中文',
        'en': 'English',
        'fr': 'Français',
        'de': 'Deutsch',
        'hi': 'हिन्दी',
        'es': 'Español',
        'th': 'ไทย',
        'pt-BR': 'Português (BR)'
    };
    const currentLang = i18next.language;
    const currentLangText = document.getElementById('current-lang-text');
    if(currentLangText) {
        currentLangText.textContent = langMap[currentLang] || currentLang;
    }

    document.querySelectorAll('.lang-switcher-dropdown a').forEach(a => {
        const lang = a.getAttribute('data-lang');
        if (lang === currentLang) {
            a.classList.add('active');
        } else {
            a.classList.remove('active');
        }
    });
}

function setupLanguageSwitcher() {
     const switcher = document.querySelector('.lang-switcher');
     const currentButton = document.querySelector('.lang-switcher-current');
     const dropdown = document.querySelector('.lang-switcher-dropdown');

    if (!switcher || !currentButton || !dropdown) return;

     currentButton.addEventListener('click', (event) => {
         event.stopPropagation();
         switcher.classList.toggle('show');
     });

     document.querySelectorAll('.lang-switcher-dropdown a').forEach(a => {
        const lang = a.getAttribute('data-lang');
        a.addEventListener('click', (event) => {
            changeLanguage(lang, event);
        });
     });

     window.addEventListener('click', (event) => {
         if (switcher && !switcher.contains(event.target)) {
             switcher.classList.remove('show');
         }
     });
}

// Function to fetch passwords and populate the grid
function updatePasswords() {
    const data = [
      {
        "passwords": [
          { "map": "零号大坝", "code": "4984" },
          { "map": "长弓溪谷", "code": "2179" },
          { "map": "巴克什", "code": "8028" },
          { "map": "航天基地", "code": "2176" },
          { "map": "潮汐监狱", "code": "0000" },
          { "map": "衔尾蛇行动", "code": "0000" }
        ]
      }
    ];
    
    try {
        const latestData = data[0]; // Assuming the first entry is the latest
        const passwordGrid = document.querySelector('.password-grid');
        const updateTimeEl = document.querySelector('.update-time');

        if (!latestData || !passwordGrid || !updateTimeEl) {
            console.error('Could not find necessary elements to update passwords.');
            return;
        }

        // Clear any existing content
        passwordGrid.innerHTML = ''; 
        
        // Update the time display using i18next for formatting
        const today = new Date();
        const dateOptions = { month: 'long', day: 'numeric' };
        const formattedDate = new Intl.DateTimeFormat(i18next.language, dateOptions).format(today);
        updateTimeEl.textContent = i18next.t('passwords.updated_at', { date: formattedDate });

        // Populate new password cards
        latestData.passwords.forEach(p => {
            const mapKeyMap = {
                '零号大坝': 'maps.zero_dam', 'Zero Dam': 'maps.zero_dam',
                '长弓溪谷': 'maps.layali_grove', 'LayaliGrove': 'maps.layali_grove',
                '巴克什': 'maps.brakkesh', 'Brakkesh': 'maps.brakkesh',
                '航天基地': 'maps.space_city', 'SpaceCity': 'maps.space_city',
                '潮汐监狱': 'maps.tidal_prison', 'Tidal Prison': 'maps.tidal_prison',
                '衔尾蛇行动': 'maps.operation_ouroboros', 'Operation Ouroboros': 'maps.operation_ouroboros'
            };
            const mapKey = mapKeyMap[p.map] || p.map;

            const card = document.createElement('div');
            card.className = 'password-card';
            card.innerHTML = `
                <div class="map-name">${i18next.t(mapKey, { defaultValue: p.map })}</div>
                <div class="password-value">${p.code}</div>
            `;
            
            let linkUrl = null;
            if (p.map === '零号大坝' || p.map === 'Zero Dam') linkUrl = 'ZeroDam.html';
            if (p.map === '长弓溪谷' || p.map === 'LayaliGrove') linkUrl = 'LayaliGrove.html';
            if (p.map === '巴克什' || p.map === 'Brakkesh') linkUrl = 'Brakkesh.html';
            if (p.map === '航天基地' || p.map === 'SpaceCity') linkUrl = 'SpaceCity.html';
            if (p.map === '潮汐监狱' || p.map === 'Tidal Prison') linkUrl = '#'; // No direct link for tidal prison
            if (p.map === '衔尾蛇行动' || p.map === 'Operation Ouroboros') linkUrl = '#'; // No direct link for ouroboros

            const link = document.createElement('a');
            link.href = linkUrl || '#';
            link.className = 'password-card-link';
            link.appendChild(card);
            passwordGrid.appendChild(link);
        });
    } catch (error) {
        console.error("Error updating passwords from hardcoded data:", error);
        // If something goes wrong, the static HTML will remain.
    }
} 