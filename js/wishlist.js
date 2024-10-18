document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('wishlist-books');
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    // If wishlist is empty, display a message
    if (wishlist.length === 0) {
        container.innerHTML = '<p class="text-center">Your wishlist is empty.</p>';
        return;
    }

    // Show loader while fetching data
    container.innerHTML = '<p class="text-center">Loading wishlist...</p>';

    // Fetch wishlisted books from Gutendex API
    function fetchWishlistBooks() {
        // Convert the wishlist array into a string of IDs
        const bookIds = wishlist.join(',');

        fetch(`https://gutendex.com/books?ids=${bookIds}`)
            .then(response => response.json())
            .then(data => {
                displayBooks(data.results);
            })
            .catch(error => {
                console.error('Error fetching wishlisted books:', error);
                container.innerHTML = '<p>Error loading wishlist. Please try again later.</p>';
            });
    }

    // Display books from the wishlist
    function displayBooks(books) {
        container.innerHTML = ''; // Clear the loader or previous content

        books.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.classList.add('col-md-4', 'product-card');

            const imageUrl = book.formats['image/jpeg'] || 'default-book-cover.jpg';
            const authorName = book.authors && book.authors.length > 0 ? book.authors[0].name : 'Unknown Author';
            const genres = book.subjects && book.subjects.length > 0 ? book.subjects.join(', ') : 'No genres available';
            const bookID = book.id ? book.id : 'ID not available';

            bookElement.innerHTML = `
                <div class="product-tumb">
                    <img src="${imageUrl}" alt="${book.title}" class="img-fluid">
                </div>
                <div class="product-details">
                    <h5 class="book-title">${book.title}</h5>
                    <div class="book-author">Author: ${authorName}</div>
                    <div class="book-id">ID: ${bookID}</div>
                    <div class="book-genre">Genre: ${genres}</div>
                    <div class="wishlist-icon">
                        <i class="fa fa-solid fa-heart" style="cursor: pointer;" data-book-id="${book.id}" title="Remove from Wishlist"></i>
                    </div>
                </div>
            `;

            // Add event listener to remove from wishlist
            const wishlistIcon = bookElement.querySelector('.wishlist-icon i');
            wishlistIcon.addEventListener('click', function () {
                removeFromWishlist(book.id, bookElement);
            });

            container.appendChild(bookElement);
        });
    }

    // Remove a book from the wishlist
    function removeFromWishlist(bookId, bookElement) {
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

        // Remove the book ID from the wishlist
        wishlist = wishlist.filter(id => id !== bookId);

        // Update localStorage
        localStorage.setItem('wishlist', JSON.stringify(wishlist));

        // Remove the book element from the DOM
        bookElement.remove();

        // If the wishlist is empty after removal, show a message
        if (wishlist.length === 0) {
            container.innerHTML = '<p class="text-center">Your wishlist is empty.</p>';
        }
    }

    // Fetch wishlisted books on page load
    fetchWishlistBooks();
});
