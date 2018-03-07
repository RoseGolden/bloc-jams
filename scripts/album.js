var setSong = function (songNumber) {
   if (currentSoundFile) {
        currentSoundFile.stop();
    }

    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];

    // #1
      currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
          // #2
          formats: [ 'mp3' ],
          preload: true
      });
      setVolume(currentVolume);
    };

var seek = function(time) {
     if (currentSoundFile) {
         currentSoundFile.setTime(time);
     }
 };

var setVolume = function(volume) {
     if (currentSoundFile) {
          currentSoundFile.setVolume(volume);
      }
      if (currentSoundFile) {
          currentSoundFile.stop();
  }
};

var getSongNumberCell = function (number) {
  return $('.song-item-number[data-song-number="' + number + '"]');
};

// function takes songNumber, songName, songLength as arguments and populates
// the song row template accordingly

var createSongRow = function(songNumber, songName, songLength) {
  var template =
     '<tr class="album-view-song-item">'
     // HTML data attributes allow us to store information in an attribute on an HTML element: "data-song-number"
     // This allows us to access the data held in the attribute using DOM methods when the mouse
     // leaves the table row, and the song number's table cell returns to its original state.
     +
     '  <td class="song-item-number" data-song-number="' + parseInt(songNumber) + '">' + parseInt(songNumber) + '</td>' +
     '  <td class="song-item-title">' + songName + '</td>' +
     '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>' +
     '</tr>';

var $row = $(template);
var clickHandler = function () {
var songNumber = parseInt($(this).attr('data-song-number'));

if (currentlyPlayingSongNumber !== null) {
   // Revert to song number for currently playing song because user started playing new song.
   var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
   currentlyPlayingCell.html(currentlyPlayingSongNumber);
}
if (currentlyPlayingSongNumber !== songNumber) {
   // Switch from Play -> Pause button to indicate new song is playing.
   setSong(songNumber);
   currentSoundFile.play();
   updateSeekBarWhileSongPlays();
   currentSongFromAlbum = currentAlbum.songs[songNumber - 1];

   var $volumeFill = $('.volume .fill');
   var $volumeThumb = $('.volume .thumb');
   $volumeFill.width(currentVolume + '%');
   $volumeThumb.css({ left: currentVolume + '%' });

   $(this).html(pauseButtonTemplate);
   updatePlayerBarSong();
} else if (currentlyPlayingSongNumber === songNumber) {
   if (currentSoundFile.isPaused()) {
       $(this).html(pauseButtonTemplate);
       $('.main-controls .play-pause').html(playerBarPauseButton);
       currentSoundFile.play();
       updateSeekBarWhileSongPlays();
   } else {
       $(this).html(playButtonTemplate);
       $('.main-controls .play-pause').html(playerBarPlayButton);
       currentSoundFile.pause();
   }
}
};

var onHover = function (event) {
var songNumberCell = $(this).find('.song-item-number');
var songNumber = songNumberCell.attr('data-song-number');

if (parseInt(songNumber) !== currentlyPlayingSongNumber) {
   songNumberCell.html(playButtonTemplate);
}
};
    var offHover = function (event) {
    var songNumberCell = $(this).find('.song-item-number');
    var songNumber = songNumberCell.attr('data-song-number');

    if (parseInt(songNumber) !== currentlyPlayingSongNumber) {
       songNumberCell.html(parseInt(songNumber));
}
};

  $row.find('.song-item-number').click(clickHandler);

  $row.hover(onHover, offHover);

  return $row;
  };


// setCurrentAlbum function will be called when window loads
// takes one of the album objects as an argument and inject stored information
// into the template

 var setCurrentAlbum = function(album) {
     currentAlbum = album;
     // #1
     var $albumTitle = $('.album-view-title');
     var $albumArtist = $('.album-view-artist');
     var $albumReleaseInfo = $('.album-view-release-info');
     var $albumImage = $('.album-cover-art');
     var $albumSongList = $('.album-view-song-list')

     // #2
       $albumTitle.text(album.title);
       $albumArtist.text(album.artist);
       $albumReleaseInfo.text(album.year + ' ' + album.label);
       $albumImage.attr('src', album.albumArtUrl);

     // #3
     $albumSongList.empty();

     // #4
     for (var i = 0; i < album.songs.length; i++) {
       var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
       $albumSongList.append($newRow);
     }
};

 // sets the text to current time in the song

 var setCurrentTimeInPlayerBar = function (currentTime) {
    // var currentTime = currentSoundFile.getTime();
    // $('.current-time').text(currentTime);
    $('.current-time').text(filterTimeCode(currentTime));
};

var setTotalTimeInPlayerBar = function (totalTime) {
// var totalTime = currentSoundFile.getDuration();
// $('.total-time').text(totalTime);
$('.currently-playing .total-time').text(filterTimeCode(totalTime));

};

//FIX THIS SHIT!!!
var filterTimeCode = function (timeInSeconds) {
  parseFloat(timeInSeconds)


};
// FIX THIS SHIT TODAY!!!

 var updateSeekBarWhileSongPlays = function() {
      if (currentSoundFile) {
          // #10
          currentSoundFile.bind('timeupdate', function(event) {
              // #11
              var seekBarFillRatio = this.getTime() / this.getDuration();
              var $seekBar = $('.seek-control .seek-bar');

              updateSeekPercentage($seekBar, seekBarFillRatio);
              setCurrentTimeInPlayerBar(this.getTime());

          });
      }
  };

 var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    // #1
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);

    // #2
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
 };


 var setupSeekBars = function () {
    var $seekBars = $('.player-bar .seek-bar');

    $seekBars.click(function (event) {
        // #3
        // pageX is a jQuery specific event value
        // which holds the X (horizontal coordinate) at which the event occured
        // subtract the offset () of the seek bar
        // offset (): method for finding the distance between an element and the edge of the browser window
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        // #4
        // calculate seekBarFillRatio
        var seekBarFillRatio = offsetX / barWidth;

        if ($(this).parent().attr('class') == 'seek-control') {
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            setVolume(seekBarFillRatio * 100);
        }
        // #5
        updateSeekPercentage($(this), seekBarFillRatio);
    });
    //  #7
    // find elements with class of .thumb and add an event listener for the mousedown event
    // mousedown event will fire as soon as the button is pressed down
    // where as click event will fire after a button has been pressed AND released quickly
    // mouseup event will fire when button is released
        $seekBars.find('.thumb').mousedown(function (event) {
        // #8
        // $this = .thumb node
        var $seekBar = $(this).parent();

        $(document).bind('mousemove.thumb', function (event) {
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;

            if ($seekBar.parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());
            } else {
                setVolume(seekBarFillRatio);
            }

            updateSeekPercentage($seekBar, seekBarFillRatio);
        });

        $(document).bind('mouseup.thumb', function () {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
};


 var trackIndex = function(album, song) {
     return album.songs.indexOf(song);
 };

 var previousSong = function() {
     var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
     // Note that we're _decrementing_ the index here
     currentSongIndex--;

     if (currentSongIndex < 0) {
         currentSongIndex = currentAlbum.songs.length - 1;
     }

     // Save the last song number before changing it
     var lastSongNumber = currentlyPlayingSongNumber;

     // Set a new current song
     setSong(currentSongIndex + 1);
     currentSoundFile.play();
     currentlyPlayingSongNumber = currentSongIndex + 1;
     currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

     // Update the Player Bar information
     updatePlayerBarSong();

     $('.main-controls .play-pause').html(playerBarPauseButton);

     var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
     var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

     $previousSongNumberCell.html(pauseButtonTemplate);
     $lastSongNumberCell.html(lastSongNumber);
 };


 var nextSong = function() {
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Note that we're _incrementing_ the song here
    currentSongIndex++;

    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }

    // Save the last song number before changing it
    var lastSongNumber = currentlyPlayingSongNumber;

    // Set a new current song
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

    // Update the Player Bar information
    updatePlayerBarSong();

    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};



var togglePlayFromPlayerBar = function () {
  var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);

  if (currentSoundFile.isPaused()) {
      $(currentlyPlayingCell).html(pauseButtonTemplate);
      $('.main-controls .play-pause').html(playerBarPauseButton);
      currentSoundFile.play();
      updateSeekBarWhileSongPlays();
  } else {
      $(currentlyPlayingCell).html(playButtonTemplate);
      $('.main-controls .play-pause').html(playerBarPlayButton);
      currentSoundFile.pause();
  }
};

 // Album button templates
  var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
  var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
  var playerBarPlayButton = '<span class="ion-play"></span>';
  var playerBarPauseButton = '<span class="ion-pause"></span>';

  // Store state of playing songs
 var currentAlbum = null;
 var currentlyPlayingSongNumber = null;
 var currentSongFromAlbum = null;
 var currentSoundFile = null;
 var currentVolume = 80;
 var $previousButton = $('.main-controls .previous');
 var $nextButton = $('.main-controls .next');
 var $playPauseButton = $('.main-controls .play-pause');

 var updatePlayerBarSong = function() {

    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    setTotalTimeInPlayerBar(currentSongFromAlbum.duration);

};

$(document).ready(function () {
    setCurrentAlbum(albumPicasso);
    setupSeekBars();
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    $playPauseButton.click(togglePlayFromPlayerBar);
});
