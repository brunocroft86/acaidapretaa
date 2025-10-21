document.addEventListener("DOMContentLoaded", () => {

    const cart = [];
    const cartButton = document.getElementById("cart-button");
    const cartModal = document.getElementById("cart-modal");
    const modalClose = document.querySelector(".modal-close");
    const addToCartButtons = document.querySelectorAll(".add-to-cart");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalPrice = document.getElementById("cart-total-price");
    const cartCount = document.getElementById("cart-count");
    const orderForm = document.getElementById("order-form");
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const trocoField = document.getElementById("troco-field");
    
    // ----- NÚMERO DE WHATSAPP DA LOJA -----
    const seuNumeroWhatsApp = "5521978308046"; // Formato internacional (Brasil + DDD + Número)

    // Abrir o modal do carrinho
    cartButton.addEventListener("click", () => {
        updateCartModal();
        cartModal.style.display = "block";
    });

    // Fechar o modal
    modalClose.addEventListener("click", () => {
        cartModal.style.display = "none";
    });

    // Fechar o modal clicando fora dele
    window.addEventListener("click", (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = "none";
        }
    });

    // Adicionar item ao carrinho
    addToCartButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            const name = event.target.dataset.name;
            const price = parseFloat(event.target.dataset.price);
            
            // Verifica se o item já está no carrinho
            const existingItem = cart.find(item => item.name === name);
            
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ name, price, quantity: 1 });
            }

            // Animação de feedback
            button.innerText = "Adicionado!";
            button.style.background = "#4caf50"; // Verde
            setTimeout(() => {
                button.innerText = "Adicionar";
                button.style.background = "var(--secondary-color)";
            }, 1000);

            updateCartCount();
        });
    });

    // Atualiza o contador do ícone do carrinho
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.innerText = totalItems;
    }

    // Atualiza o conteúdo do modal (lista de itens e total)
    function updateCartModal() {
        cartItemsContainer.innerHTML = ""; // Limpa a lista
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p>Seu carrinho está vazio.</p>";
            cartTotalPrice.innerText = "R$ 0,00";
            updateCartCount();
            return;
        }

        cart.forEach((item, index) => {
            total += item.price * item.quantity;

            const itemElement = document.createElement("div");
            itemElement.classList.add("cart-item");
            // Define o preço como 'Grátis' se for 0.00
            const itemPriceDisplay = item.price === 0 ? "Grátis" : `R$ ${(item.price * item.quantity).toFixed(2)}`;
            
            itemElement.innerHTML = `
                <span>${item.quantity}x ${item.name}</span>
                <span>
                    <strong>${itemPriceDisplay}</strong>
                    <button class="remove-item" data-index="${index}">&times;</button>
                </span>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        cartTotalPrice.innerText = `R$ ${total.toFixed(2)}`;
        
        // Adiciona evento aos botões de remover
        document.querySelectorAll(".remove-item").forEach(button => {
            button.addEventListener("click", (event) => {
                const index = parseInt(event.target.dataset.index);
                removeFromCart(index);
            });
        });
        
        updateCartCount();
    }

    // Remover item do carrinho
    function removeFromCart(index) {
        const item = cart[index];
        if (item.quantity > 1) {
            item.quantity--;
        } else {
            cart.splice(index, 1);
        }
        updateCartModal();
    }

    // Mostrar/Ocultar campo de troco
    paymentRadios.forEach(radio => {
        radio.addEventListener("change", (event) => {
            if (event.target.value === "Dinheiro") {
                trocoField.style.display = "block";
            } else {
                trocoField.style.display = "none";
            }
        });
    });

    // Enviar Pedido para o WhatsApp
    orderForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Impede o envio do formulário

        if (cart.length === 0) {
            alert("Seu carrinho está vazio!");
            return;
        }

        const address = document.getElementById("address").value;
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        const troco = document.getElementById("troco").value;
        const observacoes = document.getElementById("observacoes").value;
        
        if (!address) {
            alert("Por favor, preencha seu endereço.");
            return;
        }

        // Monta a mensagem
        let total = 0;
        let message = "Olá, *Açaí da Preta*! 💜\nGostaria de fazer o seguinte pedido:\n\n";

        cart.forEach(item => {
            // === BUG CORRIGIDO AQUI ===
            // (Estava item.key, mudei para item.quantity)
            const itemSubtotal = item.price * item.quantity;
            total += itemSubtotal;
            
            // Define o preço como 'Grátis' se for 0.00
            const itemPriceDisplay = item.price === 0 ? "Grátis" : `R$ ${itemSubtotal.toFixed(2)}`;

            message += `*${item.quantity}x* ${item.name} - ${itemPriceDisplay}\n`;
        });

        message += "----------------------------\n";
        message += `*Total: R$ ${total.toFixed(2)}*\n\n`;
        message += "----------------------------\n";
        message += `*Endereço de Entrega:*\n${address}\n\n`;
        
        message += `*Forma de Pagamento:* ${paymentMethod}\n`;

        // Lógica de pagamento
        if (paymentMethod === "Dinheiro") {
            if (troco) {
                message += `(Troco para: R$ ${troco})\n`;
            } else {
                message += `(Não preciso de troco)\n`;
            }
        } else if (paymentMethod === "Cartão") {
            message += `(Levar a maquininha)\n`;
        } else if (paymentMethod === "Pix") {
            message += `(Pagamento na entrega)\n`;
        }
        
        if(observacoes) {
            message += `\n*Observações:*\n${observacoes}\n`;
        }

        // Codifica a mensagem para URL
        const encodedMessage = encodeURIComponent(message);
        
        // Abre o link do WhatsApp
        const whatsappURL = `https://wa.me/${seuNumeroWhatsApp}?text=${encodedMessage}`;
        window.open(whatsappURL, '_blank');
    });

});