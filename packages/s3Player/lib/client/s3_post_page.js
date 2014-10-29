templates["post_page"] = "s3PostPage";



Template[getTemplate('s3PostPage')].created = function () {
  post = this.data;
  //var pop = Popcorn($("#ourvideo"));
  videoLinkMp4 = post.videoLink;
  console.log(videoLinkMp4);
  };

Template[getTemplate('s3PostPage')].helpers({
  videoShit: function(){
  	var videoLink = post.videoLink;
  console.log(videoLink);
  if (videoLink.indexOf(".mp4") >= 1) {
  	var videoLinkMp4 = videoLink;
  	console.log(videoLinkMp4);
  	return ' '
   } else {return false};
  }

  })
Template[getTemplate('s3PostPage')].rendered = function() {
console.log(videoLinkMp4);
$("video#ourVideo").attr(src,videoLinkMp4);
Popcorn.player( "baseplayer" );
var pop = Popcorn.baseplayer($("#ourvideo"));
pop.play();
};


