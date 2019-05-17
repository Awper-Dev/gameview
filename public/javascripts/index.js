function submitAddress() {
    fetch('/actions/addserver', {
        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ip: document.querySelector('#ip').value,
            port: document.querySelector('#port').value,
        }),
    }).then(async (r) =>
        Swal.fire({
            position: 'top-end',
            type: ((r.ok) ? 'success' : 'error'),
            text: await r.text(),
            showConfirmButton: false,
            timer: 3000,
            background: '#2a2c2e',
        }));
    setTimeout(() => updateServers(false), 4000);
}

function updateServers(setTimer = true) {
    const table = document.querySelector('#server-table');
    const div = document.querySelector('#server-container');
    if (!div) return;
    const started = Date.now();
    Swal.fire({
        title: 'Pulling Data from Server',
        background: '#2a2c2e',
        position: 'top-end',
        showConfirmButton: false,
        footer: '<a>Pulling information about your Servers to our Servers</a>',
        onBeforeOpen: Swal.showLoading,
        type: 'info',
    });

    fetch('/actions/getservers', {
        method: 'GET',
    }).then(async (r) => {
        clearTable(table);
        const res = (await r.json());
        res.sort((a, b) => a.online - b.online);
        res.forEach(element => {
            table.appendChild(renderRow(element));
            div.appendChild(table);
        });

        setTimeout(Swal.close, (started - 1000 < Date.now()) ? 1000 : 0);
    });
    if (setTimer) setTimeout(updateServers, 300000);
}

function renderRow(obj) {
    const tr = document.createElement('tr');
    renderTableData(4, obj).forEach(x => tr.appendChild(x));
    return tr;
}

function renderTableData(count, obj) {
    const tdArray = [];
    for (let index = 0; index < count; index++) tdArray.push(document.createElement('td'));
    tdArray[0].appendChild(document.createTextNode(obj.online ? '✓' : '✗'));
    tdArray[0].classList.add(obj.online ? 'online' : 'offline');
    tdArray[1].appendChild(document.createTextNode(obj.ip));
    tdArray[2].appendChild(document.createTextNode(obj.ping));
    tdArray[3].appendChild(document.createTextNode(obj.extra || `${obj.players} Players`));
    return tdArray;
}

function clearTable(element) {
    for (let i = 1; i < element.rows.length;) {
        element.deleteRow(i);
    }
}