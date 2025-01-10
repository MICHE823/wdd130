const cartListButton = document.querySelector("#store-cart-btn")
const cartListContainer = document.querySelector("#cart-list")
const ProductContainer = document.querySelector("#product-list")
const ProductSingle = document.querySelector("#product-list .product-item").cloneNode(true)
ProductSingle.classList.remove("d-none")

const cartGroup = document.querySelector("#cart-list .cart-list-group")
const cartItem = document.querySelector("#cart-list .cart-list-group .cart-item").cloneNode(true)
cartItem.classList.remove("d-none")

const cartCount = document.querySelector('#cart-count-badge')
const cartTotal = document.querySelector('#cart-list .cart-total')
const clearCart = document.querySelector('#cart-list .cart-remove-all')

const searchBox = document.querySelector('#product-search')
const displayModal = document.querySelector('#product-display-wrapper')
const displayModalClose = displayModal.querySelector(".product-display-close-btn")

var data;
var dataObj = [];
var cartItems = [];

cartListButton.addEventListener("click", function (e) {
    e.preventDefault();
    if (cartListContainer.classList.contains("cart-open"))
        cartListContainer.classList.remove("cart-open");
    else
        cartListContainer.classList.add("cart-open");
})

async function getSampleData() {
    try {
        const res = await fetch("assets/data.json");
        const data = await res.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}

function updateCart() {
    var total = 0;
    var totalCount = 0;
    cartGroup.innerHTML = "";
    if (cartItems.length > 0) {
        cartItems.forEach(item => {
            if (!(item == null || item == "")) { 
            // console.log(item)
            const _cartItem = cartItem.cloneNode(true)
            _cartItem.dataset.id = item.id
            _cartItem.querySelector(".cart-img img").setAttribute("src", dataObj[item.id].img_path)
            _cartItem.querySelector(".cart-prod-title").innerText = dataObj[item.id].name
            _cartItem.querySelector(".cart-prod-price").innerText = (dataObj[item.id].price).toLocaleString("en-US", { style: "decimal", maximumFractionDigits: 2, minimumFractionDigits: 2 })
            _cartItem.querySelector(".cart-prod-price").dataset.price = dataObj[item.id].price
            _cartItem.querySelector(".card-qty").value = item.qty

            total += (parseInt(item.qty) * parseFloat(dataObj[item.id].price))
            totalCount += parseInt(item.qty);
            cartGroup.append(_cartItem)

            _cartItem.querySelector(".cart-qty-add").addEventListener("click", function (e) {
                e.preventDefault();
                cartItems[item.id].qty = parseInt(item.qty) + 1;
                localStorage.setItem("cartItems", JSON.stringify(cartItems))
                updateCart()
            })

            _cartItem.querySelector(".cart-qty-min").addEventListener("click", function (e) {
                e.preventDefault();
                if (item.qty == 1) {
                    delete cartItems[item.id];
                } else {
                    cartItems[item.id].qty = parseInt(item.qty) - 1;
                }
                localStorage.setItem("cartItems", JSON.stringify(cartItems))
                updateCart()
            })

            _cartItem.querySelector(".cart-remove-prod").addEventListener("click", function (e) {
                e.preventDefault();
                delete cartItems[item.id];
                localStorage.setItem("cartItems", JSON.stringify(cartItems))
                updateCart()
            })
        }
        })
}
cartCount.innerText = (totalCount).toLocaleString("en-US")
cartTotal.innerText = (total).toLocaleString("en-US", { style: "decimal", maximumFractionDigits: 2, minimumFractionDigits: 2 })
}

async function load_data() {
    if (!!data && data.length > 0) {
        data.forEach(prodData => {
            const ProdCard = ProductSingle.cloneNode(true);
            ProdCard.dataset.id = prodData.id
            ProdCard.querySelector(".product-img>img").setAttribute("src", prodData.img_path)
            ProdCard.querySelector(".product-title").innerText = prodData.name
            ProdCard.querySelector(".product-price").innerText = (prodData.price).toLocaleString("en-US", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 })
            ProdCard.querySelector(".product-description").innerText = prodData.description

            ProdCard.querySelector(`.product-ratings .rating-star:nth-last-child(${prodData.rating})`).classList.add("rated")

            ProductContainer.append(ProdCard)

            ProdCard.querySelector(".btn-action-add-cart").addEventListener("click", function (e) {
                e.preventDefault();
                if (!!cartItems[prodData.id]) {
                    cartItems[prodData.id].id = prodData.id;
                    cartItems[prodData.id].qty = parseInt(cartItems[prodData.id].qty) + 1;
                } else {
                    cartItems[prodData.id] = { id: prodData.id, qty: 1 };
                    console.log(cartItems)
                }
                localStorage.setItem("cartItems", JSON.stringify(cartItems))
                updateCart()
            })
            ProdCard.querySelector(".btn-action-view").addEventListener("click", function (e) {
                e.preventDefault();

                displayModal.querySelector(".product-display-img img").setAttribute("src", prodData.img_path)
                displayModal.querySelector(".product-display-details .product-display-title").innerText = prodData.name
                displayModal.querySelector(".product-display-details .product-display-price").innerText = (prodData.price).toLocaleString("en-US")
                displayModal.querySelector(".product-display-details .product-display-description").innerText = prodData.description
                if (displayModal.querySelector(`.product-display-details .product-display-ratings .rating-star.rated`) != undefined)
                    displayModal.querySelector(`.product-display-details .product-display-ratings .rating-star.rated`).classList.remove("rated")

                displayModal.querySelector(`.product-display-details .product-display-ratings .rating-star:nth-last-child(${prodData.rating})`).classList.add("rated")

                if (!displayModal.classList.contains("show"))
                    displayModal.classList.add("show");
            })

        });
    }
}

function searchProd() {
    var keyword = this.value
    keyword = keyword.toLowerCase();

    ProductContainer.querySelectorAll(".product-item").forEach(el => {
        var itemContent = el.innerText;
        itemContent = itemContent.toLowerCase();
        if (itemContent.includes(keyword)) {
            if (el.classList.contains("d-none"))
                el.classList.remove("d-none")
        } else {
            if (!el.classList.contains("d-none"))
                el.classList.add("d-none")
        }
    })

}

window.addEventListener("DOMContentLoaded", async () => {
    document.querySelector("#product-list .product-item").remove();
    document.querySelector("#cart-list .cart-item").remove();

    getSampleData().then((listOfProducts) => {
        data = listOfProducts;
        data.forEach(prod => {
            dataObj[prod.id] = prod;
        })
        load_data();

        clearCart.addEventListener("click", function (e) {
            e.preventDefault()
            cartItems = [];
            localStorage.setItem("cartItems", JSON.stringify(cartItems))
            updateCart()
        })

        cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]")
        updateCart()

        searchBox.addEventListener("input", searchProd)
        searchBox.addEventListener("change", searchProd)
        searchBox.addEventListener("cut", searchProd)
        searchBox.addEventListener("keypress", searchProd)
        searchBox.addEventListener("paste", searchProd)

        displayModalClose.addEventListener("click", function (e) {
            e.preventDefault()

            if (displayModal.classList.contains("show"))
                displayModal.classList.remove("show");
        })
    })

})
