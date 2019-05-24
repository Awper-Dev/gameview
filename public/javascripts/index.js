/* global $ Swal*/
const menuIconEl = $('.menu-icon');
const sidenavEl = $('.sidenav');
const sidenavCloseEl = $('.sidenav__close-icon');

// Add and remove provided class names
function toggleClassName(el, className) {
    if (el.hasClass(className)) {
        el.removeClass(className);
    } else {
        el.addClass(className);
    }
}

// Open the side nav on click
menuIconEl.on('click', function () {
    toggleClassName(sidenavEl, 'active');
});

// Close the side nav on click
sidenavCloseEl.on('click', function () {
    toggleClassName(sidenavEl, 'active');
});

// eslint-disable-next-line no-unused-vars
function submitAddress() {
    Swal.fire({
        title: 'Your Servers Connection:',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off',
        },
        showCancelButton: true,
        confirmButtonText: 'Add Server',
        showLoaderOnConfirm: true,
        preConfirm: (server) => {
            return fetch('/actions/addserver', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ip: server,
                    }),
                })
                .then(async response => {
                    if (!response.ok) throw new Error(await response.text());
                    return response.text();
                })
                .catch(error => Swal.showValidationMessage(error));
        },
        allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        if (result.value) {
            Swal.fire({
                title: 'Added Server',
                text: result.value,
                type: 'info',
            });
            setTimeout(() => updateServers(false), 2000);
        }
    });
}

// eslint-disable-next-line no-unused-vars
function removeAddress() {
    Swal.fire({
        title: 'Connection you want to remove:',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off',
        },
        showCancelButton: true,
        confirmButtonText: 'Remove Server',
        showLoaderOnConfirm: true,
        preConfirm: (server) => {
            return fetch('/actions/removeserver', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ip: server,
                    }),
                })
                .then(async response => {
                    if (!response.ok) throw new Error(await response.text());
                    return response.text();
                })
                .catch(error => Swal.showValidationMessage(error));
        },
        allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        if (result.value) {
            Swal.fire({
                title: 'Removed Server',
                text: result.value,
                type: 'info',
            });
            setTimeout(() => updateServers(false), 2000);
        }
    });
}

function updateServers(setTimer = true) {
    const table = document.querySelector('#server-table');
    const div = document.querySelector('#server-card');
    const overview = document.querySelector('.main-overview');
    Swal.fire({
        toast: true,
        title: 'Pulling Data',
        position: 'top-end',
        showConfirmButton: false,
        onBeforeOpen: Swal.showLoading,
        type: 'info',
    });

    fetch('/actions/getservers', {
        method: 'GET',
    }).then(async (r) => {
        clearTable(table);
        const res = (await r.json());
        const online = res.filter(x => x.online);
        res.sort((a, b) => a.online - b.online);
        overview.firstElementChild.classList.remove('offline-card');
        overview.firstElementChild.classList.remove('online-card');
        overview.firstElementChild.lastElementChild.innerHTML = `${online.length} / ${res.length} Server Online`;
        overview.firstElementChild.classList.add((online.length === res.length) ? 'online-card' : 'offline-card');
        res.forEach(element => {
            table.appendChild(renderRow(element));
            div.appendChild(table);
        });
        setTimeout(Swal.close, 500);
        if (setTimer) setTimeout(() => updateServers(true), 300000);
    });
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