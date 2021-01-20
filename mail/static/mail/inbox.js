document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Inbox functionality
  //Fetch from API
  fetch(`/emails/${mailbox}`)
  //Then, get the response and convert it to jason
  .then(response => response.json())
  //Then, build html with data
  .then(emails => {
    //Create a row wrapper for all emails
    const wrapper = document.createElement('div');
    wrapper.id = 'wrapper';
    wrapper.className = 'row';
    document.querySelector('#emails-view').append(wrapper);
    // Traverse the json object gotten from the response
    for (i = 0; i < emails.length; i++) {
      //For each email create a col div
      const mail_div = document.createElement('div');
      mail_div.dataset.id = emails[i].id;
      if (mailbox == 'sent'){
        // Set a class to the col
        mail_div.className = 'mail-div col-12 unread d-flex align-items-center'
        //Create subcolum for recipient
        const col_recipient = document.createElement('div');
        col_recipient.className = 'col-md-4 d-flex align-items-center'
        col_recipient.innerHTML = `To : ${emails[i].recipients}`;
        mail_div.append(col_recipient);
      }
      else{
        // Set a class to the col
        if (emails[i].read) {
          mail_div.className = 'mail-div col-12 read d-flex align-items-center'
        }
        else {
          mail_div.className = 'mail-div col-12 unread d-flex align-items-center'
        }
        //Create subcolumn for sender
        const col_sender = document.createElement('div');
        col_sender.className = 'col-md-4 d-flex align-items-center'
        col_sender.innerHTML = emails[i].sender;
        mail_div.append(col_sender);
      }

      //Create subcolums for subject and timestamp
      const col_subject = document.createElement('div');
      col_subject.className = 'col-md-4 d-flex align-items-center'
      col_subject.innerHTML = emails[i].subject;
      mail_div.append(col_subject);

      const col_timestamp = document.createElement('div');
      col_timestamp.className = 'col-md-4 d-flex align-items-center justify-content-end'
      col_timestamp.innerHTML = emails[i].timestamp;
      mail_div.append(col_timestamp)
      
      //Append div to parent div
      document.querySelector('#wrapper').append(mail_div);
    }
  })
  // Then, listen for a click on each email col
  .then( () => {
    document.querySelectorAll('.mail-div').forEach(div => {
      div.onclick = () => {
        console.log(div.dataset.id)
      }
    })
  })
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Listen for form submission
  document.querySelector('#compose-form').onsubmit = function (){
    // Get field values from the form
    const recipients = document.querySelector('#compose-recipients').value;
    const subject =  document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    // Send POST request to server
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: recipients,
            subject: subject,
            body: body
        })
      })
      .then(response => response.json())
      .then(result => {
          // Print result
          console.log(result);
      });
    // Load inbox again
    load_mailbox('inbox');
    // Stop form from submitting
    return false;
  }
}

