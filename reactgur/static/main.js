;(function() {
    $('#modal_upload_input').fileupload({
        url: '/upload',
        dataType: 'json',
        done: function(e, data) {

        },
        progressall: function(e, data) {

        }
    });
})();