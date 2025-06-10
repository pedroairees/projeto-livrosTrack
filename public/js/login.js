document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;
  const msg = document.getElementById('msgErro');

  msg.textContent = '';  // limpa mensagens anteriores

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.error || 'Ocorreu um erro';
    } else {
      window.location.href = '/index.html';  // redirecionar para a tela principal correta
    }

  } catch (err) {
    console.error(err);
    msg.textContent = 'Erro de conexão. Tente novamente';
  }
});