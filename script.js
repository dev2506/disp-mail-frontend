document.addEventListener('DOMContentLoaded', function () {

    function fetchFromCookies(searchKey) {
        const cookieArr = document.cookie.split('; ')
        let reqVal = ""
        cookieArr.forEach(pair => {
            const [key, value] = pair.split('=')
            if (key === searchKey) {
                reqVal = value
            }
        })
        return reqVal
    }

    async function fetchRandomEmail() {
        const emailInput = document.getElementById('temp-email');

        const cookieArr = document.cookie.split(';')
        if (document.cookie !== "" && cookieArr.length > 0) {
            emailInput.value = cookieArr[0].split('=')[1]
            return
        }

        const response = await fetch('https://2q9vmlk63i.execute-api.eu-west-2.amazonaws.com/create-user', {
            method: "POST"
        }).catch(err => {
            console.error("error creating user")
            return null
        })
        let data = {
            jwtToken: "",
            mail: "loading..."
        }

        if (!response) return
        data = await response.json()
        emailInput.value = data.mail

        document.cookie = `mail=${data.mail}; max-age=21600`
        document.cookie = `token=${data.jwtToken}; max-age=21600`

    }

    async function fetchEmails() {
        // const response = await new Promise((resolve) => { setTimeout(() => resolve("Mail fetched"), 2000) })
        const token = fetchFromCookies("token")
        const response = await fetch('https://2q9vmlk63i.execute-api.eu-west-2.amazonaws.com/get-mails', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).catch(err => {
            console.error("error fetching mails.")
            return null
        })

        let data = []
        if (response) {
            data = await response.json()
        }
        if (data.length > 0) {
            data.forEach((email, ind) => {
                const waitingForMailsDiv = document.getElementById('waiting-for-mails')
                waitingForMailsDiv.classList.add('waiting-for-mails-hidden')
                const emailContainer = document.getElementById('inbox-dataList')
                const emailItem = document.createElement('div');
                emailItem.classList.add('inbox-item');
                emailItem.id = `inbox-item-${ind + 1}`
                emailItem.innerHTML = `
                        <div class="inner-inbox-item">${email.sender}</div>
                        <div class="inner-inbox-item">${email.subject}</div>
                        <div class="inner-inbox-item">View</div>
                    `;
                emailItem.addEventListener('click', function () {
                    const oldDiv1 = document.getElementById('inbox-header')
                    const oldDiv2 = document.getElementById('inbox-dataList')
                    const newDiv1 = document.getElementById('inbox-header-2')
                    const newDiv2 = document.getElementById('inbox-dataList-2')

                    const senderDiv = document.createElement('div')
                    senderDiv.innerHTML = `<div>Sender: ${email.sender}</div>`
                    senderDiv.classList.add('inbox-item-2')

                    const subjectDiv = document.createElement('div')
                    subjectDiv.innerHTML = `<div>Subject: ${email.subject}</div>`
                    subjectDiv.classList.add('inbox-item-2')

                    const htmlDiv = document.createElement('div')
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(email.html, 'text/html');
                    htmlDiv.innerHTML = doc.body.innerHTML

                    newDiv2.appendChild(senderDiv)
                    newDiv2.appendChild(subjectDiv)
                    newDiv2.appendChild(htmlDiv)

                    oldDiv1.classList.add("inbox-header-hidden")
                    oldDiv2.classList.add("inbox-dataList-hidden")
                    newDiv1.classList.add("inbox-header-2")
                    newDiv2.classList.add("inbox-dataList-2")

                })
                emailContainer.appendChild(emailItem)

            });
        }

    }

    fetchRandomEmail()
    fetchEmails()

    document.getElementById('copy-btn').addEventListener('click', function () {
        const emailInput = document.getElementById('temp-email');
        emailInput.select();
        emailInput.setSelectionRange(0, 99999)
        document.execCommand('copy');
    });
});
