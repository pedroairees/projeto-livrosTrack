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

  const res = await fetch("/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, autor, status }),
  });

  if (res.ok) {
    e.target.reset();
    document.getElementById("modal").classList.add("hidden");
    window.location.reload();
  } else {
    alert("Erro ao adicionar livro");
  }
});

window.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("/items");
  const livros = await res.json();

  const wrapperAndamento = document.querySelector(".andamento-wrapper");
  const wrapperConcluidos = document.querySelector(".concluidos-wrapper");

  wrapperAndamento.innerHTML = "";
  wrapperConcluidos.innerHTML = "";

  livros.forEach((livro) => {
    const div = document.createElement("div");
    div.classList.add("livros-wrapper");

    const statusAtual = livro.status;
    const novoStatus = statusAtual === "andamento" ? "concluido" : "andamento";
    const textoStatus =
      statusAtual === "andamento" ? "Em andamento" : "Concluído";
    const textoBotao =
      statusAtual === "andamento"
        ? "Marcar como concluído"
        : "Marcar como em andamento";

    div.innerHTML = `
      <p>${livro.nome}</p>
      <p>${livro.autor}</p>
      <p>${textoStatus}</p>
      <button class="btn-edit" data-id="${livro.id}" data-status="${statusAtual}">${textoBotao}</button>
      <button class="btn-del" data-id="${livro.id}">Excluir</button>
    `;

    if (statusAtual === "andamento") {
      wrapperAndamento.appendChild(div);
    } else {
      wrapperConcluidos.appendChild(div);
    }
  });
});

// Ações de alterar status ou excluir
document.getElementById("livros-lista").addEventListener("click", async (e) => {
  const btn = e.target;
  const id = btn.dataset.id;
  if (!id) return;

  if (btn.classList.contains("btn-del")) {
    const res = await fetch(`/items/${id}`, { method: "DELETE" });
    if (res.ok) {
      window.location.reload();
    } else {
      alert("Erro ao excluir livro");
    }
  }

  if (btn.classList.contains("btn-edit")) {
    const statusAtual = btn.dataset.status;
    const novoStatus = statusAtual === "andamento" ? "concluido" : "andamento";

    const res = await fetch(`/items/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });

    if (res.ok) {
      window.location.reload();
    } else {
      alert("Erro ao atualizar status");
    }
  }
});
