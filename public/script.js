try {
  var SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
} catch (e) {
  console.error(e);
}

// var option = {
//   animation: true,
//   delay: 2000,
// };

// var toast = $("#livetoast");
// var toast1 = new bootstrap.Toast(toast, option);

// var toastElList = [].slice.call(document.querySelectorAll(".toast"));
// var toastList = toastElList.map(function (toastEl) {
//   return new bootstrap.Toast(toastEl, option);
// });

var noteTextarea = $("#floatingTextarea2");
var instructions = $("#recording-instructions");
var notesList = $("ul#notes");
var toastclbtn = $("#closebuttontoast");

var noteContent = "";

// Get all notes from previous sessions and display them.
var notes = getAllNotes();
renderNotes(notes);

/*-----------------------------
        Voice Recognition 
  ------------------------------*/

// If false, the recording will stop after a few seconds of silence.
// When true, the silence period is longer (about 15 seconds),
// allowing us to keep recording even when the user pauses.
recognition.continuous = true;

// This block is called every time the Speech APi captures a line.
recognition.onresult = function (event) {
  // event is a SpeechRecognitionEvent object.
  var current = event.resultIndex;

  // Get a transcript of what was said.
  var transcript = event.results[current][0].transcript;

  // Add the current transcript to the contents of our Note.
  // There is a weird bug on mobile, where everything is repeated twice.
  // There is no official solution so far so we have to handle an edge case.
  var mobileRepeatBug =
    current == 1 && transcript == event.results[0][0].transcript;

  if (!mobileRepeatBug) {
    noteContent += transcript;
    noteTextarea.val(noteContent);
  }
};

recognition.onstart = function () {
  // Add your toast
};

recognition.onspeechend = function () {
  //   instructions.text(
  //     "You were quiet for a while so voice recognition turned itself off."
  //   );
  // Add your toast
};

recognition.onerror = function (event) {
  //   if (event.error == "no-speech") {
  //     instructions.text("No speech was detected. Try again.");
  //   }
  // add your toast
};

/*-----------------------------
        App buttons and input 
  ------------------------------*/

$("#start-record-btn").on("click", function (e) {
  if (noteContent.length) {
    noteContent += " ";
  }
  recognition.start();
});

// $("#closebuttontoast").on("click", () => {
//   $(".toast").dispose();
// });

$("#pause-record-btn").on("click", function (e) {
  recognition.stop();
  console.log("Voice recognition paused.");
});

// Sync the text inside the text area with the noteContent variable.
noteTextarea.on("input", function () {
  noteContent = $(this).val();
});

$("#save-note-btn").on("click", function (e) {
  recognition.stop();

  if (!noteContent.length) {
    console.log("could note save empty notes");
    // instructions.text(
    //   "Could not save empty note. Please add a message to your note."
    // );
  } else {
    // Save note to localStorage.
    // The key is the dateTime with seconds, the value is the content of the note.
    saveNote(new Date().toLocaleString(), noteContent);

    // Reset variables and update UI.
    noteContent = "";
    renderNotes(getAllNotes());
    noteTextarea.val("");
    console.log("Note saved successfully.");

    // toast1.show();
  }
});

notesList.on("click", function (e) {
  e.preventDefault();
  var target = $(e.target);

  // Listen to the selected note.
  if (target.hasClass("listen-note")) {
    var content = target.closest(".note").find(".content").text();
    readOutLoud(content);
  }

  // Delete note.
  if (target.hasClass("delete-note")) {
    var dateTime = target.siblings(".date").text();
    deleteNote(dateTime);
    target.closest(".note").remove();
  }
});

/*-----------------------------
        Speech Synthesis 
  ------------------------------*/

function readOutLoud(message) {
  var speech = new SpeechSynthesisUtterance();

  // Set the text and voice attributes.
  speech.text = message;
  speech.volume = 1;
  speech.rate = 1;
  speech.pitch = 1;

  window.speechSynthesis.speak(speech);
}

function renderNotes(notes) {
  var html = "";
  if (notes.length) {
    notes.forEach(function (note) {
      html += `<li class="note">
          <p class="header">
            <span class="date">${note.date}</span>
            <a href="#" class="listen-note" title="Listen to Note">Listen to Note</a>
            <a href="#" class="delete-note" title="Delete">Delete</a>
          </p>
          <p class="content">${note.content}</p>
        </li>`;
    });
  } else {
    html = '<li><p class="content">You don\'t have any notes yet.</p></li>';
  }
  notesList.html(html);
}

function saveNote(dateTime, content) {
  localStorage.setItem("note-" + dateTime, content);
}

function getAllNotes() {
  var notes = [];
  var key;
  for (var i = 0; i < localStorage.length; i++) {
    key = localStorage.key(i);
    console.log(i);
    console.log(key);

    if (key.substring(0, 5) == "note-") {
      notes.push({
        date: key.replace("note-", ""),
        content: localStorage.getItem(localStorage.key(i)),
      });
    }
  }
  console.log(notes);
  return notes;
}

function deleteNote(dateTime) {
  localStorage.removeItem("note-" + dateTime);
}
