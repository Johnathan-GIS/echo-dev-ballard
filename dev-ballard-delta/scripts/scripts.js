const signinBtn = document.querySelector("#signin-btn");
const pwdBox = document.querySelector("#pwd-box");
const userBox = document.querySelector("#user-box");
const message = document.querySelector("#message");

async function findUser(userName, password) {
  const response = await fetch("../assets/data/users.json");

  if (!response.ok) {
    throw new Error("Could not load local JSON");
  }

  // response.json() reads the JSON TEXT (a string) from users.json and PARSES it
  // into a real JS array of objects we can use. (async, so we await it)
  const users = await response.json(); // JSON text from the file -> JS array of objects

  // OLD WAY: hard-code each array item. Breaks as soon as a 3rd user is added,
  // and the password is stored in a global variable.
  //
  // if(userName == data[0].name){
  //   // garfied
  //   jsonPassword = data[0].password;
  //   console.log('garfield json pwd: ', jsonPassword);
  // }
  // else if(userName == data[1].name){
  //     jsonPassword = data[1].password;
  //     console.log('jon json pwd: ', jsonPassword);
  // }

  // NEW WAY: .find() walks the array for us and returns the FIRST user where
  // the function returns true (or undefined if nobody matches).
  // Why it beats a hand-written loop: no counter or index to manage, no
  // "let match = null" variable to set, it stops as soon as it finds a match,
  // and it reads like English: "find the user with this name and password".
  // It works for 2 users or 200 without changing the code.
  return users.find(
    (user) =>
      user.name.toLowerCase() === userName.toLowerCase() &&
      user.password === password,
  );
}

signinBtn.addEventListener("click", async function () {
  try {
    const user = await findUser(userBox.value.trim(), pwdBox.value);

    if (!user) {
      message.textContent = "nope. try again.";
      pwdBox.value = "";
      return;
    }

    const session = {
      username: user.name,
      authenticated: true,
      role: user.role,
    };
    // sessionStorage can ONLY store strings, so JSON.stringify() converts our
    // JS object into a JSON string: '{"username":"Jon","authenticated":true,...}'
    sessionStorage.setItem("session", JSON.stringify(session)); // JS object -> JSON string
    window.location.href = "private.html";
  } catch (error) {
    console.error(error);
    message.textContent = "something went wrong. try again later.";
  }
});

const cardRow = document.querySelector("#card-row");
const message = document.querySelector("#message");
const userGreeting = document.querySelector("#user-greeting");
const addForm = document.querySelector("#add-form");
const signoutBtn = document.querySelector("#signout-btn");

// who is signed in? (null if nobody) - JSON.parse turns the saved string into an object
const session = JSON.parse(sessionStorage.getItem("session")); // JSON string -> JS object

// our whole app in ONE object (see appState in the lesson)
let appState = JSON.parse(sessionStorage.getItem("appState")); // JSON string -> JS object

// save = JS object -> JSON string -> sessionStorage
function saveState() {
  sessionStorage.setItem("appState", JSON.stringify(appState)); // JS object -> JSON string
}

async function loadState() {
  // 1. is there saved data? use it, so a refresh doesn't destroy our work
  if (!appState) {
    // 2. no? fetch the starting data from the JSON file
    const response = await fetch("assets/data/socks.json");
    if (!response.ok) {
      throw new Error("Could not load socks.json");
    }
    const socks = await response.json(); // JSON text -> JS array

    appState = {
      app: { name: "Sock Finder", version: "0.1" },
      user: null,
      data: socks,
      session: { started: new Date().toISOString() },
    };
  }
  // the user comes from sign-in, not from the data file
  appState.user = session;
  saveState();
}

// which sock is being edited right now (null = none)
let editingId = null;

// RENDER: JSON is the data, the DOM is the presentation
function render() {
  cardRow.innerHTML = ""; // clear old cards, then rebuild from the data

  appState.data.forEach(function (sock) {
    const col = document.createElement("div");
    col.className = "col-md-4";

    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h4");
    title.className = "card-header";
    title.textContent = sock.id === editingId ? "editing..." : sock.title;

    const body = document.createElement("div");
    body.className = "card-body";

    const footer = document.createElement("div");
    footer.className = "card-footer";

    if (sock.id === editingId) {
      // EDIT MODE: show a small form with one input per field
      const titleInput = document.createElement("input");
      titleInput.value = sock.title;
      const descInput = document.createElement("input");
      descInput.value = sock.description;
      const locInput = document.createElement("input");
      locInput.value = sock.location;
      body.append(titleInput, descInput, locInput);

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "save";
      saveBtn.addEventListener("click", function () {
        // input values -> update the object -> save -> render
        sock.title = titleInput.value;
        sock.description = descInput.value;
        sock.location = locInput.value;
        editingId = null;
        saveState();
        render();
      });

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "cancel";
      cancelBtn.addEventListener("click", function () {
        editingId = null;
        render();
      });
      footer.append(saveBtn, cancelBtn);
    } else {
      // VIEW MODE: each field in its own element
      const desc = document.createElement("p");
      desc.textContent = sock.description;
      const loc = document.createElement("p");
      loc.textContent = "Location: " + sock.location;
      body.append(desc, loc);

      // UPDATE: signed-in users can edit
      if (session) {
        const editBtn = document.createElement("button");
        editBtn.textContent = "edit";
        editBtn.addEventListener("click", function () {
          editingId = sock.id;
          render();
        });
        footer.appendChild(editBtn);
      }
    }

    // DELETE: admin only. (front-end check only - not real security)
    if (session && session.role === "admin") {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "delete";
      deleteBtn.addEventListener("click", function () {
        // keep every sock EXCEPT this one
        appState.data = appState.data.filter(function (s) {
          return s.id !== sock.id;
        });
        saveState();
        render();
      });
      footer.appendChild(deleteBtn);
    }

    card.append(title, body, footer);
    col.appendChild(card);
    cardRow.appendChild(col);
  });
}

// CREATE: form values -> new object -> appState -> sessionStorage -> render
document.querySelector("#add-btn").addEventListener("click", function () {
  const title = document.querySelector("#new-title").value.trim();
  if (!title) {
    message.textContent = "a sock needs a title.";
    return;
  }
  appState.data.push({
    id: Date.now(), // simple unique id
    title: title,
    description: document.querySelector("#new-description").value,
    location: document.querySelector("#new-location").value,
  });
  saveState();
  message.textContent = "";
  render();
});

signoutBtn.addEventListener("click", function () {
  sessionStorage.removeItem("session");
  window.location.reload();
});

// start the app
async function init() {
  try {
    await loadState();
    render();
  } catch (error) {
    console.error(error);
    message.textContent = "could not load the socks.";
  }

  if (session) {
    userGreeting.textContent = "hi, " + session.username + " (" + session.role + ")";
    addForm.hidden = false; // only signed-in users can create
    signoutBtn.hidden = false;
  }
}

init();