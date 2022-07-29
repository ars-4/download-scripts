/**
 * htps://ars-7.ml/
 * https://feedbacks-frontend.vercel.app/#/about/
 */

function FeedbackForm(
    _divElement,
    website_name,
    theme_color = "#42b983"
) {


    this.div = document.getElementById(_divElement);
    let nameInput = document.createElement('input');
    let emailInput = document.createElement('input');
    let feedbackInput = document.createElement('input');
    let btnInput = document.createElement('button');

    this.div.appendChild(nameInput);
    this.div.appendChild(emailInput);
    this.div.appendChild(feedbackInput);
    this.div.appendChild(btnInput);


    nameInput.placeholder = "Full Name";
    emailInput.placeholder = "Contact";
    feedbackInput.placeholder = "Message";

    // Styles
    let style = document.createElement('style');
    let head = document.getElementsByTagName('head');
    head[0].appendChild(style);
    style.innerHTML += "#"+_divElement+"{display:block;align-items:center;justify-content:center;text-align:center;width:150px;padding:20px;}";
    style.innerHTML += "#"+_divElement+" input {padding:5px;outline:none;display:block;margin:2px;border-radius:4px;border:1px solid #242424;color:"+theme_color+";}";
    style.innerHTML += "#"+_divElement+" input::placeholder {color: "+theme_color+";}";
    style.innerHTML += "#"+_divElement+" button {text-align:center;padding:5px;margin-top:4px;background-color:"+theme_color+";border:3px solid "+theme_color+";color:#fff;border-radius:4px;cursor:pointer;}";

    btnInput.innerHTML = "Submit";
    btnInput.addEventListener('click', () => {
        let body = {
            "website_name": website_name,
            "name": nameInput.value,
            "email": emailInput.value,
            "feedback": feedbackInput.value
        }
        fetch("https://feedbacks-backend.herokuapp.com/api/feedbacks/", {
            method: "POST",
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json; charset=utf8'
            },
            body: JSON.stringify(body)
        }).then(response => {
            return response.json();
        }).then(data => {
            if (data['error']) {
                if (data['error'] == 'false') {
                    console.log("Successfully sent your feedback!");
                }
                else {
                    throw new Error("Server responded with error=true");
                }
            }
            else {
                throw new Error("Your feedback didn't reached the server");
            }
        }).catch(error => {
            throw new Error("Catched error -> " + error);
        }) // Fetch
        console.log("Data -> " + JSON.stringify(body));
        nameInput.value = "";
        emailInput.value = "";
        feedbackInput.value = ""
    });

}

