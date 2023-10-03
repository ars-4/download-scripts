const container = document.querySelector('.chat-tool');

function init() {
    container.style.position = 'fixed';
    container.style.right = '1%';
    container.style.bottom = '3%';

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
    form.style.border = '2px solid #242424';
    form.style.borderRadius = '4px';
    form.style.position = 'absolute';
    form.style.right = '24px';
    form.style.bottom = '24px';
    form.style.transition = '0.5s';
    form.style.overflow = 'hidden';

    let output = document.createElement('div');
    output.style.border = '1px solid #242424';
    output.style.margin = '4px';
    output.style.height = '320px';
    form.appendChild(output);

    let inputGroup = document.createElement('div');
    inputGroup.style.display = 'flex';
    inputGroup.style.justifyContent = 'space-between';
    inputGroup.style.alignItems = 'center';
    inputGroup.style.margin = '8px 4px';

    let input = document.createElement('input');
    input.type = 'text';
    input.style.width = '100%';
    input.style.borderRadius = '4px';
    input.style.border = '1px solid #242424';
    input.style.padding = '8px';
    input.style.outline = 'none';
    input.placeholder = "Your Message";
    inputGroup.appendChild(input);

    let inputButton = document.createElement('button');
    inputButton.innerText = "Send";
    inputButton.style.backgroundColor = '#f44336';
    inputButton.style.borderRadius = '4px';
    inputButton.style.border = '1px solid #f44336';
    inputButton.style.padding = '8px';
    inputButton.style.color = '#fff';
    inputButton.style.cursor = 'pointer';
    inputGroup.appendChild(inputButton);

    form.appendChild(inputGroup);

    button.addEventListener('click', () => {
      if(form.is_visible) {
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

}


init();