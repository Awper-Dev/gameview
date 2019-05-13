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
    }).then(async (r) => Swal.fire({
        position: 'top-end',
        type: ((r.ok) ? 'success' : 'error'),
        text: await r.text(),
        showConfirmButton: false,
        timer: 3000,
        background: '#2a2c2e',
    }));
}