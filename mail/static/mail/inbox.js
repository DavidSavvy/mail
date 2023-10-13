document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(email = null) {
  //email = email || null;
  console.log(email);
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#individual-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Fill fields if reply
  if (email != null){
    document.querySelector('#compose-recipients').value = email["sender"];
    console.log(email['subject'].slice(0,3));
    (email['subject'].slice(0,3) != 'Re:') ? (document.querySelector('#compose-subject').value = `Re: ${email["subject"]}`) : (document.querySelector('#compose-subject').value = email["subject"])
    document.querySelector('#compose-body').value = `On ${email['timestamp']}, ${email['sender']} wrote: \n${email["body"]}`;
  }

  // POST email using API when form is submitted
  document.querySelector('#compose-form').onsubmit = () => {
    // See API details
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result);
      // Sends error
      if (Object.keys(result)[0] === "error") {
        throw new error();
      }
      load_mailbox('sent');

    })
    .catch (error => alert("Invalid email"))

    // Prevents page refresh
    return false;
  };
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#individual-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetches list of emails based on mailbox inputted
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach((email) => {
      child = document.createElement("div");

      // Changes display if mailbox chosen is "sent"
      if (mailbox === "sent"){
        child.innerHTML = `<span style="font-weight: bold; margin: 0px 15px 0px 10px;">${email["recipients"]}</span> ${email["subject"]} <span style="float: right; margin-right: 10px;">${email["timestamp"]}</span>`;
      } else {
        child.innerHTML = `<span style="font-weight: bold; margin: 0px 15px 0px 10px;">${email["sender"]}</span> ${email["subject"]} <span style="float: right; margin-right: 10px;">${email["timestamp"]}</span>`;
      }

      // Checks if email has been read or not
      if (email["read"] === true) {
        child.style.background = "lightgrey";
      } else {
        child.style.background = "white";
      }

      // Div styling
      child.style.borderStyle = "solid";
      child.style.borderWidth = "thin";
      child.style.height = "40px";
      child.style.paddingTop = "5px";
      child.style.cursor = "pointer";
      document.querySelector('#emails-view').append(child);

      // Adds email clickability
      child.onclick = () => {
        const id = email["id"];
        console.log("selected", id);
        // Removes reply button if user is looking at sent email
        if (mailbox === "sent"){
          document.querySelector('#reply').style.display = 'none';
        } else {
          document.querySelector('#reply').style.display = 'inline-block';

          // Adds reply button functionality
          document.querySelector('#reply').addEventListener('click', () => {compose_email(email)});
        }

        // Adds archive button if user is looking at inbox
        if (mailbox === "inbox"){
          document.querySelector('#archive').style.display = 'inline-block';

          // Adds archive button functionality
          document.querySelector('#archive').onclick = () => {
            console.log("archived", id);
            fetch(`/emails/${id}`, {
              method: 'PUT',
              body: JSON.stringify({
                archived: true
              })
            })
            load_mailbox('inbox');
          };
        } else {
          document.querySelector('#archive').style.display = 'none';
        }

        // Adds unarchive button if user is looking at archived emails
        if (mailbox === "archive"){
          document.querySelector('#unarchive').style.display = 'inline-block';

          // Adds unarchive button functionality
          document.querySelector('#unarchive').onclick = () => {
            console.log("unarchived", id);
            fetch(`/emails/${id}`, {
              method: 'PUT',
              body: JSON.stringify({
                archived: false
              })
            })
            load_mailbox('inbox');
          };
        } else {
          document.querySelector('#unarchive').style.display = 'none';
        }

        // Marks an email read
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })

        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#individual-view').style.display = 'block';

        // Fills email information
        document.querySelector('#from').innerHTML = email["sender"];
        document.querySelector('#to').innerHTML = email["recipients"];
        document.querySelector('#subject').innerHTML = email["subject"];
        document.querySelector('#timestamp').innerHTML = email["timestamp"];
        document.querySelector('#body').innerHTML = email["body"];
      }
    })
    console.log(emails);
  })
}

