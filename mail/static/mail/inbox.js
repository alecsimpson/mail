document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Sends a post request with email details, then loads sent mailbox
  document.querySelector('#compose-form').onsubmit = () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(res => {
      load_mailbox('sent')
    })

    return false; // Prevents form from submitting the request itself
  }

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch('/emails/'+mailbox)
  .then(response => response.json())
  .then(emails => {
    console.log(emails)
    emails.forEach(email => {
      outer_div = document.createElement('div')
      outer_div.className += 'email'
      outer_div.addEventListener('click', () => {
        load_email(email.id)
        fetch('/emails/'+email.id, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
        console.log(mailbox)
        if (!email.archived) {
          outer_div = document.querySelector('#email-view')
          archive_button = document.createElement('button')
          archive_button.innerHTML = 'Archive'
          archive_button.classList += 'btn btn-dark'
          archive_button.style = 'margin-right: 10px;'
          archive_button.addEventListener('click', () => {
            fetch('/emails/'+email.id, {
              method: 'PUT',
              body: JSON.stringify({
                archived: true
              })
            })
            .then(()=>{
              load_mailbox('inbox')
            })
          })

          outer_div.append(archive_button)
        }
        else if (email.archived) {
          console.log('made it')
          outer_div = document.querySelector('#email-view')
          archive_button = document.createElement('button')
          archive_button.innerHTML = 'Unarchive'
          archive_button.classList += 'btn btn-dark'
          archive_button.style = 'margin-right: 10px;'
          archive_button.addEventListener('click', () => {
            fetch('/emails/'+email.id, {
              method: 'PUT',
              body: JSON.stringify({
                archived: false
              })
            })
            .then(()=>{
              load_mailbox('inbox')
            })
          })

          outer_div.append(archive_button)
        }


      })

      email_div = document.createElement('div')

      email_div.className += 'emailSender'
      email_div.innerHTML = email.sender

      subject_div = document.createElement('div')
      subject_div.className += 'emailSubject'
      subject_div.innerHTML = email.subject

      timestamp_div = document.createElement('div')
      timestamp_div.className += 'emailTimestamp'
      timestamp_div.innerHTML = email.timestamp

      if(email.read) {
        outer_div.style.backgroundColor = '#dee3e3'
      }

      outer_div.append(email_div, subject_div, timestamp_div)

      document.querySelector('#emails-view').append(outer_div)
    })
  })

  function load_email(emailID){
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';

    removeChildNodes(document.querySelector('#email-view'))

    fetch('/emails/'+emailID)
    .then(response => response.json())
    .then(email => {
      from = document.createElement('div')
      from.innerHTML = `<strong>From:</strong> ${email.sender}`

      to = document.createElement('div')
      to.innerHTML = `<strong>To:</strong> ${email.recipients}`

      subject = document.createElement('div')
      subject.innerHTML = `<strong>Subject:</strong> ${email.subject}`

      timestamp = document.createElement('div')
      timestamp.innerHTML = `<strong>Timestamp:</strong> ${email.timestamp}`

      reply = document.createElement('button')
      reply.innerHTML = 'Reply'
      reply.id = 'reply-button'
      reply.className += 'btn btn-primary'
      reply.addEventListener('click', () => {
        compose_email()
        document.querySelector('#compose-recipients').value = email.sender
        document.querySelector('#compose-subject').value = email.subject.startsWith('Re: ') ? '' : 'Re: '; 
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}\n-----------------------------------------------------`
      })

      hr = document.createElement('hr')

      body = document.createElement('div')
      body.innerHTML = email.body

      document.querySelector('#email-view').append(reply, from, to, subject, timestamp, hr, body)
    })
  }
}

function removeChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
}