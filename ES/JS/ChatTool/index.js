const container = document.querySelector('.chat-tool');
const baseUri = '127.0.0.1:8000';
const primary_color = '#42b983';

const options = {
  primary_color: '#f44336',
  secondary_color: "#242424",
  accent_color: "#fff",
  baseUri: '127.0.0.1:8000',
}

async function init() {
  container.style.position = 'fixed';
  container.style.right = '1%';
  container.style.bottom = '3%';

  let style = document.getElementsByTagName('style')[0];
  style.innerHTML += `\n
  .no-scrollbar::-webkit-scrollbar {
    display: none !important;
  }\n
  `
  document.head.appendChild(style);

  let button = document.createElement('button');
  button.innerText = "+";
  button.style.backgroundColor = options.primary_color;
  button.style.borderRadius = '50%';
  button.style.aspectRatio = '1';
  button.style.border = 'none';
  button.style.padding = '8px 16px';
  button.style.fontSize = '36px';
  button.style.cursor = 'pointer';
  button.style.color = options.accent_color;
  button.style.position = 'absolute';
  button.style.right = '0';
  button.style.bottom = '0%';
  button.style.zIndex = '2';

  let form = document.createElement('div');
  form.style.width = '0px';
  form.style.height = '0px';
  form.is_visible = false;
  form.style.backgroundColor = options.accent_color;
  form.style.border = `2px solid ${options.secondary_color}`;
  form.style.borderRadius = '4px';
  form.style.position = 'absolute';
  form.style.right = '24px';
  form.style.bottom = '24px';
  form.style.transition = '0.5s';
  form.style.overflow = 'hidden';
  form.classList.add('no-scrollbar');

  let output = document.createElement('div');
  // output.style.border = '1px solid #242424';
  output.style.overflowY = 'scroll';
  output.style.margin = '4px';
  output.style.marginTop = '12px';
  output.style.height = '320px';
  form.appendChild(output);

  let inputGroup = document.createElement('div');
  inputGroup.style.display = 'flex';
  inputGroup.style.justifyContent = 'space-between';
  inputGroup.style.alignItems = 'center';
  inputGroup.style.overflow = 'hidden';
  inputGroup.style.margin = '8px 4px';
  inputGroup.style.borderRadius = '4px';
  inputGroup.style.border = `1px solid ${options.secondary_color}`;

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
  inputButton.style.backgroundColor = options.primary_color;
  inputButton.style.width = '20%';
  inputButton.style.border = 'none';
  inputButton.style.padding = '8px';
  inputButton.style.color = options.accent_color;
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
    if(form.is_visible && event.target !== button && event.target !== form && !form.contains(event.target)) {
      form.style.width = '0px';
      form.style.height = '0px';
      form.is_visible = false;
    }
  })

  container.appendChild(button);
  container.appendChild(form);

  await set_token();

  const socket = new WebSocket(`ws://${baseUri}/ws/chats/${localStorage.getItem('username').replace('#', '').toLowerCase()}/?token=${localStorage.getItem('token')}`);

  socket.onopen = async () => {
    console.log('connected');
    let messages = await get_previous_messages();
    output.innerHTML = '';

    for (let i = 0; i < messages.length; i++) {
      send_output(output, messages[i]);
    }

    socket.send(JSON.stringify({ message: "Welcome to the chat", token: localStorage.getItem('token'), url: url, msg_type: 'none' }));
  }

  window.addEventListener("hashchange", function (event) {
    socket.send(JSON.stringify({ message: "Welcome to the chat", token: localStorage.getItem('token'), url: url, msg_type: 'none' }));
  });

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.msg_type == 'msg') {
      if(data.user != localStorage.getItem('username')) {
        send_output(output, data);
        alert(data.user + ': ' + data.message);
      }
      send_output(output, data);
    }
  }

}

function send_output(parentElement, data) {
  if(data.message.includes('Welcome to the chat')) {
    return;
  }
  const output_message = document.createElement('div');
  output_message.style.border = `1px solid ${options.secondary_color}`;
  output_message.style.margin = '2%';
  output_message.style.wordBreak = 'break-all';
  output_message.style.padding = '10px 15px';
  output_message.style.backgroundColor = options.secondary_color;
  output_message.style.borderRadius = '4px';
  output_message.style.fontSize = '12px';
  output_message.style.fontWeight = 'bolder';
  let user = localStorage.getItem('username') == data.user ? 'You' : data.user;
  let user_span = document.createElement('span');
  user_span.innerHTML = `${user}: `;
  user_span.style.color = options.primary_color;
  output_message.appendChild(user_span);
  let message_span = document.createElement('span');
  if(data.message.includes('http') && data.message.includes('png') || data.message.includes('jpg') || data.message.includes('jpeg') || data.message.includes('gif')) {
    message_span.innerHTML = `<a href="${data.message}" target="_blank">
      <img src="${data.message}" style="max-width: 100%; max-height: 100%;">
    </a>`
  } else if(data.message.includes('http')) {
    message_span.innerHTML = `<a href="${data.message}" style="color: ${options.primary_color}" target="_blank">${data.message.split('files/')[1].toLowerCase()}</a>`
  } else {
    message_span.innerHTML = data.message;
  }
  message_span.style.color = options.accent_color;
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
    await fetch(`http://${baseUri}/chat/validate_token/`, {
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
  await fetch(`http://${baseUri}/chat/create_client/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => {
    return response.json()
  }).then(data => {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('username', data.data.username);
  })
}

async function get_previous_messages() {
  let messages = await fetch(`http://${baseUri}/chat/api/messages/${localStorage.getItem('username').replace('#', '').toLowerCase()}/`, {
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