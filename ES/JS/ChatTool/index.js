const container = document.querySelector('.chat-tool');
const baseUri = '127.0.0.1:8000';

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
  button.style.backgroundColor = '#f44336';
  button.style.borderRadius = '50%';
  button.style.aspectRatio = '1';
  button.style.border = 'none';
  button.style.padding = '8px 16px';
  button.style.fontSize = '36px';
  button.style.cursor = 'pointer';
  button.style.color = '#fff';
  button.style.position = 'absolute';
  button.style.right = '0';
  button.style.bottom = '0%';
  button.style.zIndex = '2';

  let form = document.createElement('div');
  form.style.width = '0px';
  form.style.height = '0px';
  form.is_visible = false;
  form.style.backgroundColor = '#fff';
  form.style.border = '2px solid #242424';
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
  inputGroup.style.border = '1px solid #242424';

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
  inputButton.style.backgroundColor = '#f44336';
  inputButton.style.width = '20%';
  inputButton.style.border = 'none';
  inputButton.style.padding = '8px';
  inputButton.style.color = '#fff';
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

  container.appendChild(button);
  container.appendChild(form);

  await set_token();

  const socket = new WebSocket(`ws://${baseUri}/ws/chats/${localStorage.getItem('username').replace('#', '').toLowerCase()}/?token=${localStorage.getItem('token')}`);

  socket.onopen = async () => {
    console.log('connected');
    let messages = await get_previous_messages();
    output.innerHTML = '';

    for (let i = 0; i < messages.length; i++) {
      const output_message = document.createElement('div');
      output_message.style.border = '1px solid #242424';
      output_message.style.margin = '2%';
      output_message.style.padding = '10px 15px';
      output_message.style.backgroundColor = '#242424';
      output_message.style.borderRadius = '4px';
      output_message.style.fontSize = '12px';
      output_message.style.fontWeight = 'bolder';
      if (localStorage.getItem('username') == messages[i].user) {
        output_message.innerHTML = `
      <span style="color: #f44336">You:</span> <span style="color: #fff">${messages[i].message}</span>`;
      } else {
        output_message.innerHTML = `
      <span style="color: #f44336">${messages[i].user}:</span> <span style="color: #fff">${messages[i].message}</span>`;
      } output.appendChild(output_message);
      output_message.scrollIntoView();
    }

    socket.send(JSON.stringify({ message: "Welcome to the chat", token: localStorage.getItem('token'), url: url, msg_type: 'none' }));
  }

  window.addEventListener("hashchange", function(event) {
    socket.send(JSON.stringify({ message: "Welcome to the chat", token: localStorage.getItem('token'), url: url, msg_type: 'none' }));
  });

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.msg_type == 'msg') {
      let output_message = document.createElement('div');
      output_message.style.border = '1px solid #242424';
      output_message.style.margin = '2%';
      output_message.style.padding = '10px 15px';
      output_message.style.backgroundColor = '#242424';
      output_message.style.borderRadius = '4px';
      output_message.style.fontSize = '12px';
      output_message.style.fontWeight = 'bolder';
      if (localStorage.getItem('username') == data.user) {
        output_message.innerHTML = `
      <span style="color: #f44336">You:</span> <span style="color: #fff">${data.message}</span>`;
      } else {
        output_message.innerHTML = `
      <span style="color: #f44336">${data.user}:</span> <span style="color: #fff">${data.message}</span>`;
      }
      output.appendChild(output_message);
      output_message.scrollIntoView();
    }
  }

}

function is_new_user() {
  let token = localStorage.getItem('token');
  return token != null && token.length > 10 ? false : true;
}

async function set_token() {
  should_create_client = true;
  if (is_new_user()) {
    console.log('new user');
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