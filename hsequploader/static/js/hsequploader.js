$(window).on('load resize', function() {
   
    //Add/remove class based on browser size when load/resize
    var w = $(window).width();

    if(w >= 1200) {
        // if larger 
        $('#docs-sidebar').addClass('sidebar-visible').removeClass('sidebar-hidden');
    } else {
        // if smaller
        $('#docs-sidebar').addClass('sidebar-hidden').removeClass('sidebar-visible');
    }
});

jQuery(function($) {
    "use strict"; // Start of use strict 
        /* ====== Toggle Sidebar ======= */
        
    $('#docs-sidebar-toggler').on('click', function(){
    
        if ( $('#docs-sidebar').hasClass('sidebar-visible') ) {

                $("#docs-sidebar").removeClass('sidebar-visible').addClass('sidebar-hidden');
            
            
        } else {

                $("#docs-sidebar").removeClass('sidebar-hidden').addClass('sidebar-visible');
            
        }
            
    });
    

    /* ====== Activate scrollspy menu ===== */
    $('body').scrollspy({target: '#docs-nav', offset: 100});
    
    /* ===== Smooth scrolling ====== */
    $('#docs-sidebar a.scrollto').on('click', function(e){
        //store hash
        var target = this.hash;    
        e.preventDefault();
        $('body').scrollTo(target, 800, {offset: -69, 'axis':'y'});
        
        //Collapse sidebar after clicking
        if ($('#docs-sidebar').hasClass('sidebar-visible') && $(window).width() < 1200){
            $('#docs-sidebar').removeClass('sidebar-visible').addClass('slidebar-hidden');
        }
        
    });
    
    /* wmooth scrolling on page load if URL has a hash */
    if(window.location.hash) {
        var urlhash = window.location.hash;
        $('body').scrollTo(urlhash, 800, {offset: -69, 'axis':'y'});
    }
    
    
    /* Bootstrap lightbox */
    /* Ref: http://ashleydw.github.io/lightbox/ */

    $(document).delegate('*[data-toggle="lightbox"]', 'click', function(e) {
        e.preventDefault();
        $(this).ekkoLightbox();
    }); 

}); // End of use strict

jQuery(function($) {
    "use strict"; // Start of use strict     
    var upload = null;
    var uploadIsRunning = false;
    var fileInput = $("#id_sequence_read_1");

    if (!tus.isSupported) {
        alertBox.classList.remove("hidden");
    }


    $("#seqProgress").hide();
    $("#toggle-btn").on('click', function () {
        if (upload) {
            if (uploadIsRunning) {
                upload.abort();
                $("#toggle-btn").html("Resume upload");
                uploadIsRunning = false;
            } else {
                upload.start();
                $("#toggle-btn").html( "Pause upload");
                uploadIsRunning = true;
            }
        }
    });


    fileInput.on("change", startUpload);

    function startUpload() {
        $('#sequenceFileChooser').hide();
        $("#seqProgress").show();
        var file = fileInput[0].files[0];
        // Only continue if a file has actually been selected.
        // IE will trigger a change event even if we reset the input element
        // using reset() and we do not want to blow up later.
        if (!file) {
            return;
        }
    
        var endpoint = '/upload/tus_upload/';
        var chunkSize = 65536;
        $("#toggle-btn").textContent = "Pause upload";
    
        var options = {
            endpoint: endpoint,
            chunkSize: chunkSize,
            retryDelays: [0, 1000, 3000, 5000],
            parallelUploads: 1,
            metadata: {
            filename: file.name,
            filetype: file.type
            },
            onError : function (error) {
                if (error.originalRequest) {
                    if (window.confirm("Failed because: " + error + "\nDo you want to retry?")) {
                    upload.start();
                    uploadIsRunning = true;
                    return;
                    }
                } else {
                    window.alert("Failed because: " + error);
                }
                reset();    
            },
            onProgress: function (bytesUploaded, bytesTotal) {
                var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
                $(".progress-bar").css("width", percentage + "%")
                    .attr("aria-valuenow", percentage)
                    .html(percentage + "%");
                console.log(bytesUploaded, bytesTotal, percentage + "%");
            },
            onSuccess: function () {
                var successMsg = $("<p><strong>" + upload.file.name + " (" + upload.file.size + " bytes) </strong> is uploaded. <br /> <a class='btn btn-secondary' id='changeFile'>Change file</a></p>");
                console.log(upload)
                $('#id_sequence_read_1_location').val(upload.url.split('/').pop() + '/' + upload.file.name )                
                $('#id_sequence_read_1').val(null).removeAttr("required");
                setTimeout(function(){
                    $("#seqProgress").hide();
                    $("#upload-success").show();
                    $("#upload-success").html(successMsg);
                    jQuery(function($) {
                        $("#changeFile").on('click', function(){ 
                            $("#upload-success").hide();
                            $('#sequenceFileChooser').show();
                        })
                    });
                }, 1000);    
                reset();
            }
        };
    
        upload = new tus.Upload(file, options);
        upload.findPreviousUploads().then((previousUploads) => {
            askToResumeUpload(previousUploads, upload);
        });
    }
    
    function reset() {
        fileInput.value = "";
        $("#toggle-btn").html( "Pause upload")
        upload = null;
        uploadIsRunning = false;
    }

    function askToResumeUpload(previousUploads, upload) {
        if (previousUploads.length === 0) {
            upload.start()
            uploadIsRunning = true;
        }

        previousUploads.sort(function( a, b ) { 
            return new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime(); 
        });
    
        var alreadyExist = $("<p><strong>You already started uploading " + upload.file.name + " file at " + previousUploads[0].creationTime + ". Do you want to resume this upload?. <br />" +
         "<a class='btn btn-primary' id='resumeFile'>Yes, Resume</a> <a class='btn btn-secondary ml-2' id='startNewFile'>No, Start over</a></p>");
        $("#upload-success").html(alreadyExist);
        $("#upload-success").show();
        $("#seqProgress").hide();

        jQuery(function($) {
            $("#startNewFile").on('click', function(){ 
                $("#upload-success").hide();
                $("#seqProgress").show();
                upload.start()
                uploadIsRunning = true;
            });
            $("#resumeFile").on('click', function(){ 
                $("#upload-success").hide();
                $("#seqProgress").show();
                upload.resumeFromPreviousUpload(previousUploads[0]);
                upload.start()
                uploadIsRunning = true;
            });
        });
    }
});
