async function buscarPedidos() {
    try {
        const response = await fetch('/buscar-pedidos-clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar pedidos');
        }

        const pedidosFeitos = await response.json();
        const arrayElement = document.getElementById('array');
        arrayElement.innerHTML = '';

        pedidosFeitos.forEach(pedido => {
            const pedidosElement = document.createElement('div');
            pedidosElement.innerHTML = `
                <h3>Ta na mão</h3>
                <h3>${pedido.id}</h3>
                <p>Preço: ${pedido.total}</p>
                <p>Descrição: ${pedido.pagamento}</p><br>
            `;
            arrayElement.appendChild(pedidosElement);
        });

    } catch (error) {
        console.error('Erro:', error);
    }
}
