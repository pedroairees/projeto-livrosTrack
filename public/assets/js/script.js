document.getElementById("btn-add").addEventListener("click", () => {
  document.getElementById("modal").classList.remove("hidden");
});

document.getElementById("btn-cancelar").addEventListener("click", () => {
  document.getElementById("modal").classList.add("hidden");
});

document.getElementById("form-livro").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const nome = e.target.nome.value;
  const autor = e.target.autor.value;
  const status = e.target.status.value;

  await fetch("http://localhost:3000/adicionar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, autor, status }),
  });

  e.target.reset();
  document.getElementById("modal").classList.add("hidden");
  location.reload(); // recarrega para exibir novo livro
});

window.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("http://localhost:3000/livros");
  const data = await res.json();

  const wrapperAndamento = document.querySelector(".andamento-wrapper");
  const wrapperConcluidos = document.querySelector(".concluidos-wrapper");

  wrapperAndamento.innerHTML = "";
  data.andamento.forEach(livro => {
    wrapperAndamento.innerHTML += `
      <div class="livros-wrapper">
        <p>${livro.nome}</p>
        <p>${livro.autor}</p>
        <p>Em andamento</p>
      </div>
    `;
  });

  wrapperConcluidos.innerHTML = "";
  data.concluido.forEach(livro => {
    wrapperConcluidos.innerHTML += `
      <div class="livros-wrapper">
        <p>${livro.nome}</p>
        <p>${livro.autor}</p>
        <p>Concluído</p>
      </div>
    `;
  });
});