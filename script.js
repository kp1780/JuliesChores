let chores = JSON.parse(localStorage.getItem('chores')) || [
    { name: 'Clean room', points: 2 },
    { name: 'Fold towels', points: 2 }
];

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

let bonusPoints = JSON.parse(localStorage.getItem('bonusPoints')) || [];
let storeItems = JSON.parse(localStorage.getItem('storeItems')) || [
    { name: 'Extra TV time', cost: 50 },
    { name: 'Special treat', cost: 100 },
    { name: 'Choose dinner', cost: 150 }
];

let storeHistory = JSON.parse(localStorage.getItem('storeHistory')) || [];

let ADMIN_PASSWORD = localStorage.getItem('adminPassword') || "choreMaster123";

function renderChoreChart() {
    const table = document.querySelector('#choreChart');
    table.innerHTML = '';

    const adminMode = document.getElementById('adminMode').checked;
    const currentDate = new Date().toDateString();
    
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th class="chore-column">Chore</th>
        ${days.map((day, index) => `<th class="day-column day-${index}">${day}</th>`).join('')}
    `;
    table.appendChild(headerRow);

    chores.forEach((chore, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="chore-column">
                <div class="chore-name">${chore.name}</div>
                <div class="chore-points">${chore.points} points</div>
                ${adminMode ? `
                    <button class="admin-button edit" onclick="editChore(${index})">Edit</button>
                    <button class="admin-button delete" onclick="deleteChore(${index})">Delete</button>
                ` : ''}
            </td>
            ${days.map((day, dayIndex) => `
                <td class="day-column day-${dayIndex}">
                    ${adminMode ? 
                        `<input type="number" value="${chore[day] || 0}" onchange="updatePoints(${index}, '${day}', this.value)" style="width: 50px; margin-bottom: 5px; font-size: 1.2em;">
                         <br>
                         <button class="reset-chore-button" onclick="resetChore(${index}, '${day}')">Reset</button>` :
                        `<button class="chore-button ${(chore.lastCompleted && chore.lastCompleted[day] === currentDate) ? 'completed' : ''}"
                            onclick="addPoints(${index}, '${day}')" 
                            ${(chore.lastCompleted && chore.lastCompleted[day] === currentDate) ? 'disabled' : ''}>
                            ${chore[day] || 0}
                        </button>`
                    }
                </td>
            `).join('')}
        `;
        table.appendChild(row);
    });

    const totalRow = document.createElement('tr');
    totalRow.innerHTML = `
        <td class="chore-column"><strong>Daily Total</strong></td>
        ${days.map((day, dayIndex) => `
            <td class="day-column day-${dayIndex}">
                <strong>${calculateDayTotal(day)}</strong>
            </td>
        `).join('')}
    `;
    table.appendChild(totalRow);

    const totalScore = calculateTotalScore();
    const totalScoreElement = document.getElementById('totalScore');
    totalScoreElement.innerHTML = `Total Score: ${totalScore}`;
    if (document.getElementById('adminMode').checked) {
        totalScoreElement.innerHTML += ` <button class="admin-button" onclick="editTotalPoints()">Edit Total Points</button>`;
    }

    saveChores();
    saveBonusPoints();

    renderAdminPanel();
}

function updatePoints(choreIndex, day, value) {
    chores[choreIndex][day] = parseInt(value) || 0;
    saveChores();
    renderChoreChart();
}

function addPoints(choreIndex, day) {
    const currentDate = new Date().toDateString();
    if (!chores[choreIndex].lastCompleted) {
        chores[choreIndex].lastCompleted = {};
    }
    if (chores[choreIndex].lastCompleted[day] !== currentDate) {
        chores[choreIndex][day] = (chores[choreIndex][day] || 0) + chores[choreIndex].points;
        chores[choreIndex].lastCompleted[day] = currentDate;
        renderChoreChart();
    }
}

function addChore() {
    const name = prompt('Enter chore name:');
    const points = parseInt(prompt('Enter points for the chore:'));
    if (name && !isNaN(points)) {
        chores.push({ name, points });
        renderChoreChart();
    }
}

function editChore(index) {
    const chore = chores[index];
    const name = prompt('Enter new chore name:', chore.name);
    const points = parseInt(prompt('Enter new points for the chore:', chore.points));
    if (name && !isNaN(points)) {
        chores[index] = { ...chore, name, points };
        renderChoreChart();
    }
}

function deleteChore(index) {
    if (confirm('Are you sure you want to delete this chore?')) {
        chores.splice(index, 1);
        renderChoreChart();
    }
}

function calculateDayTotal(day) {
    return chores.reduce((total, chore) => total + (chore[day] || 0), 0);
}

function calculateTotalScore() {
    const choreTotal = days.reduce((total, day) => total + calculateDayTotal(day), 0);
    const bonusTotal = bonusPoints.reduce((total, bonus) => total + bonus.points, 0);
    return choreTotal + bonusTotal;
}

function saveChores() {
    localStorage.setItem('chores', JSON.stringify(chores));
}

function saveBonusPoints() {
    localStorage.setItem('bonusPoints', JSON.stringify(bonusPoints));
}

function toggleAdminMode() {
    const adminMode = document.getElementById('adminMode').checked;
    if (adminMode) {
        const password = prompt("Enter admin password:");
        if (password !== ADMIN_PASSWORD) {
            alert("Incorrect password!");
            document.getElementById('adminMode').checked = false;
            return;
        }
    }
    renderChoreChart();
    renderBonusPoints();
    renderStore();
    renderAdminPanel();
}

function addBonus() {
    const note = prompt('Enter a note for the bonus points:');
    const points = parseInt(prompt('Enter the number of bonus points:'));
    if (note && !isNaN(points)) {
        const timestamp = new Date().toISOString();
        bonusPoints.push({ note, points, timestamp });
        saveBonusPoints();
        renderBonusPoints();
        renderChoreChart();
    }
}

function deleteBonus(index) {
    if (confirm('Are you sure you want to delete these bonus points?')) {
        bonusPoints.splice(index, 1);
        saveBonusPoints();
        renderBonusPoints();
        renderChoreChart();
    }
}

function renderStore() {
    const storeSection = document.getElementById('storeSection');
    storeSection.innerHTML = '<h2>✨ Magical Store ✨</h2>';
    const adminMode = document.getElementById('adminMode').checked;

    storeItems.forEach((item, index) => {
        storeSection.innerHTML += `
            <p>
                <span class="item-name">${item.name}</span> - 
                <span class="item-cost">${item.cost} points</span> 
                <button class="purchase-button" onclick="purchaseItem('${item.name}', ${item.cost})">
                    <span class="sparkle">🛍️</span> Purchase
                </button>
                ${adminMode ? `
                    <button class="admin-button" onclick="editStoreItem(${index})">Edit</button>
                    <button class="admin-button" onclick="deleteStoreItem(${index})">Delete</button>
                ` : ''}
            </p>
        `;
    });

    if (adminMode) {
        storeSection.innerHTML += `
            <button class="bonus-button" onclick="addStoreItem()">Add Store Item</button>
        `;
    }

    renderStoreHistory();
}

function purchaseItem(name, cost) {
    const totalScore = calculateTotalScore();
    if (totalScore >= cost) {
        if (confirm(`Are you sure you want to purchase ${name} for ${cost} points?`)) {
            let remainingCost = cost;
            while (remainingCost > 0 && bonusPoints.length > 0) {
                const bonus = bonusPoints[bonusPoints.length - 1];
                if (bonus.points <= remainingCost) {
                    remainingCost -= bonus.points;
                    bonusPoints.pop();
                } else {
                    bonus.points -= remainingCost;
                    remainingCost = 0;
                }
            }
            if (remainingCost > 0) {
                for (let i = days.length - 1; i >= 0 && remainingCost > 0; i--) {
                    const day = days[i];
                    chores.forEach(chore => {
                        if (chore[day] && remainingCost > 0) {
                            if (chore[day] <= remainingCost) {
                                remainingCost -= chore[day];
                                delete chore[day];
                            } else {
                                chore[day] -= remainingCost;
                                remainingCost = 0;
                            }
                        }
                    });
                }
            }
            storeHistory.push({
                name: name,
                cost: cost,
                date: new Date().toISOString()
            });
            saveStoreHistory();
            alert(`You have purchased ${name}!`);
            renderBonusPoints();
            renderChoreChart();
            renderStore();
            renderStoreHistory();
        }
    } else {
        alert("You don't have enough points for this item.");
    }
}

function renderBonusPoints() {
    const bonusSection = document.getElementById('bonusSection');
    bonusSection.innerHTML = '<h2>🌟 Bonus Points 🌟</h2>';
    if (bonusPoints.length === 0) {
        bonusSection.innerHTML += '<p>No bonus points added yet.</p>';
    } else {
        bonusPoints.forEach((bonus, index) => {
            bonusSection.innerHTML += `
                <p>
                    <span class="bonus-note">${bonus.note}</span>: 
                    <span class="bonus-points">${bonus.points} points</span> 
                    ${document.getElementById('adminMode').checked ? 
                        `<button class="admin-button" onclick="deleteBonus(${index})">Delete</button>` : 
                        ''}
                </p>
            `;
        });
    }
    bonusSection.innerHTML += `
        <button class="bonus-button" onclick="addBonus()"><span class="sparkle">⭐</span> Add Bonus Points</button>
    `;

    renderBonusLog();
}

function renderBonusLog() {
    const bonusLog = document.getElementById('bonusLog');
    bonusLog.innerHTML = '<h3>🎉 Bonus Points History 🎉</h3>';
    if (bonusPoints.length === 0) {
        bonusLog.innerHTML += '<p>No bonus points history.</p>';
    } else {
        bonusLog.innerHTML += '<ul>';
        bonusPoints.forEach(bonus => {
            const date = new Date(bonus.timestamp);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            bonusLog.innerHTML += `
                <li>
                    <span class="log-date">${formattedDate}</span>: 
                    <span class="log-note">${bonus.note}</span> - 
                    <span class="log-points">${bonus.points} points</span>
                </li>
            `;
        });
        bonusLog.innerHTML += '</ul>';
    }
}

function addStoreItem() {
    const name = prompt('Enter item name:');
    const cost = parseInt(prompt('Enter item cost:'));
    if (name && !isNaN(cost)) {
        storeItems.push({ name, cost });
        saveStoreItems();
        renderStore();
    }
}

function editStoreItem(index) {
    const item = storeItems[index];
    const name = prompt('Enter new item name:', item.name);
    const cost = parseInt(prompt('Enter new item cost:', item.cost));
    if (name && !isNaN(cost)) {
        storeItems[index] = { name, cost };
        saveStoreItems();
        renderStore();
    }
}

function deleteStoreItem(index) {
    if (confirm('Are you sure you want to delete this store item?')) {
        storeItems.splice(index, 1);
        saveStoreItems();
        renderStore();
    }
}

function saveStoreItems() {
    localStorage.setItem('storeItems', JSON.stringify(storeItems));
}

function resetWeeklyChores() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    if (dayOfWeek === 0) {
        chores.forEach(chore => {
            days.forEach(day => {
                if (chore[day]) {
                    chore.points += chore[day];
                    delete chore[day];
                }
            });
            chore.lastCompleted = {};
        });
        saveChores();
        renderChoreChart();
    }
}

function resetChore(choreIndex, day) {
    if (confirm(`Are you sure you want to reset "${chores[choreIndex].name}" for ${day}?`)) {
        if (chores[choreIndex][day]) {
            delete chores[choreIndex][day];
        }
        if (chores[choreIndex].lastCompleted && chores[choreIndex].lastCompleted[day]) {
            delete chores[choreIndex].lastCompleted[day];
        }
        saveChores();
        renderChoreChart();
    }
}

function renderStoreHistory() {
    const storeHistorySection = document.getElementById('storeHistory');
    storeHistorySection.innerHTML = '<h3>🛒 Purchase History 🛒</h3>';
    if (storeHistory.length === 0) {
        storeHistorySection.innerHTML += '<p>No purchases made yet.</p>';
    } else {
        storeHistorySection.innerHTML += '<ul>';
        storeHistory.forEach((purchase, index) => {
            const date = new Date(purchase.date);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            storeHistorySection.innerHTML += `
                <li>
                    <span class="purchase-date">${formattedDate}</span>: 
                    <span class="purchase-item">${purchase.name}</span> - 
                    <span class="purchase-cost">${purchase.cost} points</span>
                    ${document.getElementById('adminMode').checked ? 
                        `<button class="admin-button" onclick="removePurchase(${index})">Remove</button>` : 
                        ''}
                </li>
            `;
        });
        storeHistorySection.innerHTML += '</ul>';
    }
}

function removePurchase(index) {
    if (confirm("Are you sure you want to remove this purchase? The points will be credited back.")) {
        const removedPurchase = storeHistory.splice(index, 1)[0];
        bonusPoints.push({
            note: `Refund: ${removedPurchase.name}`,
            points: removedPurchase.cost,
            timestamp: new Date().toISOString()
        });
        saveStoreHistory();
        saveBonusPoints();
        renderStoreHistory();
        renderBonusPoints();
        renderChoreChart();
        alert(`Purchase removed and ${removedPurchase.cost} points credited back.`);
    }
}

function saveStoreHistory() {
    localStorage.setItem('storeHistory', JSON.stringify(storeHistory));
}

function renderAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (!adminPanel) return;

    const adminMode = document.getElementById('adminMode').checked;
    adminPanel.style.display = adminMode ? 'block' : 'none';

    if (adminMode) {
        adminPanel.innerHTML = `
            <h2>Admin Panel</h2>
            <button class="admin-button" onclick="addChore()">Add Chore</button>
            <button class="admin-button" onclick="changeAdminPassword()">Change Password</button>
        `;
    }
}

function changeAdminPassword() {
    const newPassword = prompt("Enter new admin password:");
    if (newPassword) {
        ADMIN_PASSWORD = newPassword;
        localStorage.setItem('adminPassword', newPassword);
        alert("Admin password changed successfully!");
    }
}

function editTotalPoints() {
    const currentTotal = calculateTotalScore();
    const newTotal = parseInt(prompt(`Current total is ${currentTotal}. Enter new total:`, currentTotal));
    if (!isNaN(newTotal)) {
        const difference = newTotal - currentTotal;
        bonusPoints.push({
            note: "Admin adjustment",
            points: difference,
            timestamp: new Date().toISOString()
        });
        saveBonusPoints();
        renderChoreChart();
        renderBonusPoints();
        alert(`Total points adjusted by ${difference}. New total: ${newTotal}`);
    }
}

renderChoreChart();
renderBonusPoints();
renderStore();
renderStoreHistory();
renderAdminPanel();

resetWeeklyChores();
