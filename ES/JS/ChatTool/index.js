const container = document.querySelector('.chat-tool');

const available_icons = [
  "https://www.svgrepo.com/show/529487/chat-round.svg",
  "https://www.svgrepo.com/show/525767/chat-round.svg",
  "https://www.svgrepo.com/show/525764/chat-round-unread.svg",
  "https://www.svgrepo.com/show/457779/user-box.svg"
]

// let options = {
//   accent_color: "#f44336",
//   background_color: "#fff",
//   foreground_color: "#242424",
//   baseUri: '127.0.0.1:8000',
//   imageUrl: available_icons[1],
//   font: 'Roboto'
// }

async function init() {
  container.style.position = 'fixed';
  container.style.right = '1%';
  container.style.bottom = '3%';
  container.style.display = 'none';

  let button = document.createElement('button');
  button.innerHTML = `<img src="${options.imageUrl}" alt="chat_bubble"
  style="width: 30px;transform:rotateY(180deg);"
  >`;
  button.style.backgroundColor = options.background_color;
  button.style.borderRadius = '50%';
  button.style.aspectRatio = '1';
  button.style.border = 'none';
  button.style.display = 'flex';
  button.style.justifyContent = 'center';
  button.style.alignItems = 'center';
  button.style.padding = '4px 8px';
  button.style.fontSize = '36px';
  button.style.cursor = 'pointer';
  button.style.color = options.foreground_color;
  button.style.position = 'absolute';
  button.style.right = '0';
  button.style.bottom = '0%';
  button.style.zIndex = '2';

  let form = document.createElement('div');
  form.style.width = '0px';
  form.style.height = '0px';
  form.is_visible = false;
  form.style.backgroundColor = options.background_color;
  form.style.border = `2px solid ${options.foreground_color}`;
  form.style.borderRadius = '4px';
  form.style.fontFamily = options.font;
  form.style.position = 'absolute';
  form.style.right = '24px';
  form.style.bottom = '24px';
  form.style.transition = '0.5s';
  form.style.overflow = 'hidden';
  form.classList.add('no-scrollbar');

  let personal_information_div = document.createElement("div");
  let personal_name = document.createElement("span");
  let personal_email = document.createElement("span");
  personal_information_div.innerHTML=`
    <table>
      <tr>
        <td><img src="${available_icons[3]}" style="width: 45px;aspect-ratio:1/1;filter:invert(100%)"></td>
        <td>
          <input type="text" style="font-size: 11px;color:${options.accent_color};border:none;border-radius:4px;padding:2px;outline:none;" id="personal_name" value="${localStorage.getItem('name')}">
          <br>
          <input type="text" style="font-size: 11px;color:${options.accent_color};border:none;border-radius:4px;padding:2px;outline:none;" id="personal_email" value="${localStorage.getItem('email')}">
        </td>
      </tr>
    </table>
  `;
  personal_information_div.style.display = "flex";
  personal_information_div.style.justifyContent = "space-between";
  personal_information_div.style.alignItems = "flex-start";
  personal_information_div.style.flexDirection = "column";
  personal_information_div.style.border = '1px solid #242424';
  personal_information_div.style.padding = '1px';
  personal_information_div.style.marginBottom = '4px';
  personal_information_div.style.marginTop = '0px';
  personal_information_div.style.background = options.foreground_color;
  personal_information_div.style.color = options.foreground_color;
  form.appendChild(personal_information_div);

  let output = document.createElement('div');
  // output.style.border = '1px solid #242424';
  output.style.overflowY = 'scroll';
  output.style.margin = '4px';
  output.style.display = 'flex';
  output.style.flexDirection = 'column';
  output.style.marginTop = '12px';
  output.style.height = '265px';
  form.appendChild(output);

  let inputGroup = document.createElement('div');
  inputGroup.style.display = 'flex';
  inputGroup.style.justifyContent = 'space-between';
  inputGroup.style.alignItems = 'center';
  inputGroup.style.overflow = 'hidden';
  inputGroup.style.margin = '8px 4px';
  inputGroup.style.borderRadius = '4px';
  inputGroup.style.border = `1px solid ${options.foreground_color}`;

  let input = document.createElement('input');
  input.type = 'text';
  input.style.width = '80%';
  input.style.padding = '8px';
  input.style.outline = 'none';
  input.style.border = "none";
  input.placeholder = "Your Message";
  inputGroup.appendChild(input);

  let inputButton = document.createElement('button');
  inputButton.innerText = "Send";
  inputButton.style.backgroundColor = options.background_color;
  inputButton.style.width = '20%';
  inputButton.style.border = 'none';
  inputButton.style.padding = '8px';
  inputButton.style.color = options.foreground_color;
  inputButton.style.cursor = 'pointer';
  inputGroup.appendChild(inputButton);

  let url = window.location.href;

  inputButton.addEventListener('click', () => {
    const message = input.value;
    socket.send(JSON.stringify({ message: message, token: localStorage.getItem('token'), url: url, msg_type: 'none' }));
    input.value = '';
  })

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const message = input.value;
      socket.send(JSON.stringify({ message: message, token: localStorage.getItem('token'), url: url, msg_type: 'none' }));
      input.value = '';
    }
  })

  form.appendChild(inputGroup);

  button.addEventListener('click', () => {
    if (form.is_visible) {
      form.style.width = '0px';
      form.style.height = '0px';
      form.is_visible = false;
    } else {
      form.style.width = '300px';
      form.style.height = '400px';
      form.is_visible = true;
    }
  })

  document.addEventListener('click', (event) => {
    if (form.is_visible && event.target !== button && event.target != button.children[0] && event.target !== form && !form.contains(event.target)) {
      form.style.width = '0px';
      form.style.height = '0px';
      form.is_visible = false;
    }
  })

  container.appendChild(button);
  container.appendChild(form);

  await set_token();

  const socket = new WebSocket(`ws://${options.baseUri}/ws/chats/${localStorage.getItem('username').replace('#', '').toLowerCase()}/?token=${localStorage.getItem('token')}`);

  socket.onopen = async () => {
    console.log('connected');
    let messages = await get_previous_messages();
    output.innerHTML = '';

    container.style.display = 'block';

    for (let i = 0; i < messages.length; i++) {
      send_output(output, messages[i]);
    }

    socket.send(JSON.stringify({ message: "Welcome to the chat", token: localStorage.getItem('token'), url: url, msg_type: 'none'}));
  }

  document.getElementById('personal_name').addEventListener("focusout", function (event) {
    socket.send(JSON.stringify({ message: "Welcome to the chat", token: localStorage.getItem('token'), url: url, msg_type: 'none', personal_name: event.target.value }));
  })
  document.getElementById('personal_email').addEventListener("focusout", function (event) {
    socket.send(JSON.stringify({ message: "Welcome to the chat", token: localStorage.getItem('token'), url: url, msg_type: 'none', personal_email: event.target.value }));
  })

  window.addEventListener("hashchange", function (event) {
    socket.send(JSON.stringify({ message: "Welcome to the chat", token: localStorage.getItem('token'), url: url, msg_type: 'none' }));
  });

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.msg_type == 'msg') {
      if (data.user !== localStorage.getItem('username')) {
        send_output(output, data);
        options.imageUrl = available_icons[2]
        // button.innerHTML = ``;
        button.innerHTML = `<img src="${options.imageUrl}" alt="chat_bubble" 
        style="width: 30px;transform:rotateY(180deg);">`;
        // alert(data.user + ': ' + data.message);
      } else {
        send_output(output, data);
      }
    }
  }

}

function send_output(parentElement, data) {
  if (data.message.includes('Welcome to the chat')) {
    return;
  }
  const output_message = document.createElement('div');
  output_message.style.border = `1px solid ${options.foreground_color}`;
  output_message.style.position = 'relative';
  output_message.style.margin = '2%';
  output_message.style.width = '60%';
  output_message.style.wordBreak = 'break-all';
  output_message.style.padding = '10px 15px';
  // output_message.style.backgroundColor = options.secondary_color;
  output_message.style.backgroundColor = localStorage.getItem('username') == data.user ? options.background_color : options.foreground_color;
  output_message.style.borderRadius = '4px';
  output_message.style.fontSize = '12px';
  output_message.style.fontWeight = 'bolder';
  let triangle_span = document.createElement('span');
  triangle_span.style.position = 'absolute';
  triangle_span.style.bottom = '-8px';
  triangle_span.style.left = '0';
  triangle_span.style.width = '30px';
  triangle_span.style.height = '30px';
  triangle_span.style.transform = 'rotate(45deg)';
  triangle_span.style.backgroundColor = '#000';
  // output_message.appendChild(triangle_span);
  let user_span = document.createElement('span');
  let user = localStorage.getItem('username') == data.user ? 'You' : data.user;
  output_message.style.marginLeft = localStorage.getItem('username') == data.user ? "25%" : '0';
  user_span.innerHTML = `${user}: `;
  user_span.style.color = options.accent_color;
  output_message.appendChild(user_span);
  let message_span = document.createElement('span');
  if (data.message.includes('https') && data.message.includes('png') || data.message.includes('jpg') || data.message.includes('jpeg') || data.message.includes('gif')) {
    message_span.innerHTML = `<a href="${data.message}" target="_blank">
      <img src="${data.message}" style="max-width: 100%; max-height: 100%;">
    </a>`
  } else if (data.message.includes('https') || data.message.includes('http')) {
    message_span.innerHTML = `<a href="${data.message}" style="color: ${options.accent_color}" target="_blank">${data.message.split('files/')[1].toLowerCase()}</a>`
  } else {
    message_span.innerHTML = data.message;
  }
  // message_span.style.color = options.accent_color;
  message_span.style.color = localStorage.getItem('username') == data.user ? options.foreground_color : options.background_color;
  message_span.style.zIndex = '1';
  output_message.appendChild(message_span);
  parentElement.appendChild(output_message);
  output_message.scrollIntoView();
}

function is_new_user() {
  let token = localStorage.getItem('token');
  return token != null && token.length > 10 ? false : true;
}

async function set_token() {
  let should_create_client = true;
  if (is_new_user()) {
    console.log('new user');
    await create_client();
  } else {
    await fetch(`https://${options.baseUri}/chat/validate_token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: localStorage.getItem('token') })
    }).then(response => {
      if (response.status == 200) {
        return response.json()
      } else { return false }
    }).then(data => {
      if (data.data["username"]) {
        localStorage.setItem('username', data.data.username);
        localStorage.setItem('name', data.data.name);
        localStorage.setItem('email', data.data.email);
        should_create_client = false;
      }
    }).catch(error => {
      console.log(error);
    })
    if (should_create_client) {
      await create_client();
    }
  }
}


async function create_client() {
  await fetch(`https://${options.baseUri}/chat/create_client/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => {
    return response.json()
  }).then(data => {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('username', data.data.username);
    localStorage.setItem('name', data.data.name);
    localStorage.setItem('email', data.data.email);
  })
}

async function get_previous_messages() {
  let messages = await fetch(`https://${options.baseUri}/chat/api/messages/${localStorage.getItem('username').replace('#', '').toLowerCase()}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${localStorage.getItem('token')}`
    }
  }).then(response => {
    return response.json()
  }).then(data => {
    return data.data;
  })
  return messages;
}

init();