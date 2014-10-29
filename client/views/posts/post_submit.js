Template[getTemplate('post_submit')].helpers({
  categoriesEnabled: function(){
    return Categories.find().count();
  },
  categories: function(){
    return Categories.find();
  },
  users: function(){
    return Meteor.users.find({}, {sort: {'profile.name': 1}});
  },
  userName: function(){
    return getDisplayName(this);
  },
  isSelected: function(user){
    return user._id == Meteor.userId() ? "selected" : "";
  },
  showPostedAt: function () {
    if(Session.get('currentPostStatus') == STATUS_APPROVED){
      return 'visible'
    }else{
      return 'hidden'
    }

    // return (Session.get('currentPostStatus') || STATUS_APPROVED) == STATUS_APPROVED; // default to approved
  },
  //This should be working.
  dropzonejs: function() {
    var dropzone = '<form id="my-awesome-dropzone" action="/" class="dropzone"><input type="hidden" value="" name="S3" id="s3Url"></form>';
     Dropzone.options.myAwesomeDropzone = { maxFilesize: 10, autoProcessQueue: true, init: function(){
                        this.on("sending", function(file) {
                            console.log(file.name)
                            var s3 = new AWS.S3(options = {accessKeyId: "AKIAJ4SISOHP5EFRHNWA", secretAccessKey: "ETT3T9kXY6KJi0qAOsKpQQv37875afb4rZNDz6Sf"});
                            var fileName = file.name.replace(" ","");
                            var filenameChunks = fileName.split(".",2);
                            var fileUrl = filenameChunks[0]+Meteor.userId();
                            var fileExtension = filenameChunks[1];
                            var s3Url = "http://bwvids.s3.amazonaws.com/"+fileUrl+'.'+fileExtension;
                            console.log(s3Url);
                            var params = {
                                Bucket: 'bwvids', /* required */
                                Key: fileUrl+'.'+fileExtension, /* required */
                                ACL: 'public-read',
                                Body: file,
                                };
                        s3.putObject(params, function(err, data) {
                          if (err) console.log(err, err.stack); // an error occurred
                          else if (data)

                              //console.log(s3Url);
                              $('#s3Url').val(s3Url);
                              console.log($('#s3Url').val());

                            
                          }         // successful response
                        );
               })
                         
          }};
    return dropzone
    }
});

Template[getTemplate('post_submit')].rendered = function(){
  // run all post submit rendered callbacks
  var instance = this;
  postSubmitRenderedCallbacks.forEach(function(callback) {
    callback(instance);
  });

  Session.set('currentPostStatus', STATUS_APPROVED);
  Session.set('selectedPostId', null);
  if(!this.editor && $('#editor').exists())
    this.editor= new EpicEditor(EpicEditorOptions).load();

  $('#postedAtDate').datepicker();
  new Dropzone("form#my-awesome-dropzone");


  // $("#postUser").selectToAutocomplete(); // XXX

};

Template[getTemplate('post_submit')].events({
  'change input[name=status]': function (e, i) {
    Session.set('currentPostStatus', e.currentTarget.value);
  },
  'click input[type=submit]': function(e, instance){
    e.preventDefault();
    
    $(e.target).addClass('disabled');

    //var videoLink = $('#s3Url').val();

    
    // ------------------------------ Checks ------------------------------ //

    if(!Meteor.user()){
      throwError(i18n.t('You must be logged in.'));
      return false;
    }

    // ------------------------------ Properties ------------------------------ //

    // Basic Properties

    var properties = {
      title: $('#title').val(),
      body: instance.editor.exportFile(),
      sticky: $('#sticky').is(':checked'),
      userId: $('#postUser').val(),
      status: parseInt($('input[name=status]:checked').val()),
      videoLink: $('#s3Url').val()
    };

    // PostedAt

    var $postedAtDate = $('#postedAtDate');
    var $postedAtTime = $('#postedAtTime');
    var setPostedAt = false;
    var postedAt = new Date(); // default to current browser date and time
    var postedAtDate = $postedAtDate.datepicker('getDate');
    var postedAtTime = $postedAtTime.val();

    if ($postedAtDate.exists() && postedAtDate != "Invalid Date"){ // if custom date is set, use it
      postedAt = postedAtDate;
      setPostedAt = true;
    }

    if ($postedAtTime.exists() && postedAtTime.split(':').length==2){ // if custom time is set, use it
      var hours = postedAtTime.split(':')[0];
      var minutes = postedAtTime.split(':')[1];
      postedAt = moment(postedAt).hour(hours).minute(minutes).toDate();
      setPostedAt = true;
    }

    if(setPostedAt) // if either custom date or time has been set, pass result to properties
      properties.postedAt = postedAt;


    // URL

    var url = $('#url').val();
    if(!!url){
      var cleanUrl = (url.substring(0, 7) == "http://" || url.substring(0, 8) == "https://") ? url : "http://"+url;
      properties.url = cleanUrl;
    }

    // ------------------------------ Callbacks ------------------------------ //

    // run all post submit client callbacks on properties object successively
    properties = postSubmitClientCallbacks.reduce(function(result, currentFunction) {
        return currentFunction(result);
    }, properties);

    //console.log(properties.videoLink)
    

    // ------------------------------ Insert ------------------------------ //
    if (properties) {
      Meteor.call('post', properties, function(error, post) {
        if(error){
          throwError(error.reason);
          clearSeenErrors();
          $(e.target).removeClass('disabled');
          if(error.error == 603)
            Router.go('/posts/'+error.details);
        }else{
          trackEvent("new post", {'postId': post._id});
          if(post.status === STATUS_PENDING)
            throwError('Thanks, your post is awaiting approval.');
          Router.go('/posts/'+post._id);
        }
      });
    } else {
       $(e.target).removeClass('disabled');      
    }


  },
  'click .get-title-link': function(e){
    e.preventDefault();
    var url=$("#url").val();
    var $getTitleLink = $(".get-title-link");
    $getTitleLink.addClass("loading");
    if(url){
      $.get(url, function(response){
          if ((suggestedTitle=((/<title>(.*?)<\/title>/m).exec(response.responseText))) != null){
              $("#title").val(suggestedTitle[1]);
          }else{
              alert("Sorry, couldn't find a title...");
          }
          $getTitleLink.removeClass("loading");
       });
    }else{
      alert("Please fill in an URL first!");
      $getTitleLink.removeClass("loading");
    }
  }

});