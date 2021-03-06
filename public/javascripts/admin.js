/* global Swal updateData*/
setTimeout(() =>
    Swal.fire({
        title: 'Update available, restart?',
        html: updateData,
        showCancelButton: true,
        confirmButtonText: 'Update and Restart',
        showLoaderOnConfirm: true,
        preConfirm: () => {
            return fetch('/update')
                .then(async response => {
                    if (!response.ok) throw new Error(await response.text());
                    return response.text();
                })
                .catch(error =>
                    Swal.showValidationMessage(`Failed: ${error}`));
        },
        allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        if (result.value) {
            Swal.fire({
                title: 'Updating Server',
                type: 'success',
            });
            setTimeout(() => location.reload(true), 2000);
        }
    }), 5000);