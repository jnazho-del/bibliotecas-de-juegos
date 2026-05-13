import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Gamepad2, Search, Star, Trash2, Edit3, Plus, X, Loader2 } from 'lucide-react';

const API_URL = 'https://www.freetogame.com/api/games';
// Using a CORS proxy because freetogame doesn't allow direct browser requests
const PROXY_URL = 'https://corsproxy.io/?';

function App() {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Initial Load
  useEffect(() => {
    fetchGames();
    const savedFavorites = JSON.parse(localStorage.getItem('videoGameFavorites')) || [];
    setFavorites(savedFavorites);
  }, []);

  // Filter games when search term or games list changes
  useEffect(() => {
    const results = games.filter(game =>
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.genre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGames(results);
  }, [searchTerm, games]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${PROXY_URL}${encodeURIComponent(API_URL)}`);
      setGames(response.data.slice(0, 50)); // Limit to 50 for performance
      setError(null);
    } catch (err) {
      setError('Error al cargar los juegos. Intente más tarde.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = (game) => {
    let updatedFavorites;
    const isFav = favorites.find(f => f.id === game.id);
    
    if (isFav) {
      updatedFavorites = favorites.filter(f => f.id !== game.id);
    } else {
      updatedFavorites = [...favorites, { ...game, review: '' }];
    }
    
    setFavorites(updatedFavorites);
    localStorage.setItem('videoGameFavorites', JSON.stringify(updatedFavorites));
  };

  const handleSaveReview = () => {
    if (!selectedGame || !reviewText.trim()) return;

    const updatedFavorites = favorites.map(f => 
      f.id === selectedGame.id ? { ...f, review: reviewText } : f
    );
    
    setFavorites(updatedFavorites);
    localStorage.setItem('videoGameFavorites', JSON.stringify(updatedFavorites));
    setShowModal(false);
    setReviewText('');
    setSelectedGame(null);
  };

  const openReviewModal = (game) => {
    setSelectedGame(game);
    setReviewText(game.review || '');
    setShowModal(true);
  };

  const handleDeleteFavorite = (id) => {
    const updatedFavorites = favorites.filter(f => f.id !== id);
    setFavorites(updatedFavorites);
    localStorage.setItem('videoGameFavorites', JSON.stringify(updatedFavorites));
  };

  return (
    <div className="min-vh-100 pb-5">
      {/* Navbar */}
      <nav className="navbar sticky-top mb-4">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center nav-brand" href="#">
            <Gamepad2 className="me-2 text-primary" size={32} />
            BIBLIOTECA GAMER
          </a>
          <div className="d-flex flex-grow-1 justify-content-center px-4">
            <div className="position-relative w-100" style={{ maxWidth: '500px' }}>
              <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
                <Search size={18} />
              </span>
              <input
                type="text"
                className="form-control ps-5 shadow-sm"
                placeholder="Buscar por título o género..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="d-flex align-items-center">
            <span className="badge rounded-pill bg-primary px-3 py-2">
              <Star size={16} className="me-1 fill-white" />
              {favorites.length} Favoritos
            </span>
          </div>
        </div>
      </nav>

      <div className="container">
        {/* Error State */}
        {error && (
          <div className="alert alert-danger shadow-sm border-0 rounded-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="mb-5">
            <h2 className="mb-4 fw-bold text-primary d-flex align-items-center">
              <Star className="me-2 fill-primary" /> Mis Favoritos y Reseñas
            </h2>
            <div className="row g-4">
              {favorites.map(game => (
                <div key={game.id} className="col-md-6 col-lg-4">
                  <div className="game-card h-100 glass">
                    <img src={game.thumbnail} className="card-img-top" alt={game.title} />
                    <div className="card-body">
                      <h5 className="card-title fw-bold mb-1">{game.title}</h5>
                      <span className="badge badge-genre mb-3">{game.genre}</span>
                      
                      <div className="bg-light rounded-3 p-3 mb-3" style={{ minHeight: '80px' }}>
                        <p className="small text-muted mb-0 italic">
                          {game.review ? (
                            `" ${game.review} "`
                          ) : (
                            <span className="fst-italic opacity-50">Sin reseña aún...</span>
                          )}
                        </p>
                      </div>

                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-outline-primary flex-grow-1 rounded-pill"
                          onClick={() => openReviewModal(game)}
                        >
                          <Edit3 size={16} className="me-1" /> {game.review ? 'Editar Reseña' : 'Escribir Reseña'}
                        </button>
                        <button 
                          className="btn btn-outline-danger rounded-circle p-2"
                          onClick={() => handleDeleteFavorite(game.id)}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Games List */}
        <h2 className="mb-4 fw-bold text-dark d-flex align-items-center">
          <Plus className="me-2 text-primary" /> Explorar Juegos
        </h2>

        {loading ? (
          <div className="d-flex flex-column align-items-center py-5">
            <Loader2 className="loading-spinner animate-spin mb-3" />
            <p className="text-muted fw-semibold">Buscando los mejores títulos...</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredGames.length > 0 ? (
              filteredGames.map(game => (
                <div key={game.id} className="col-md-4 col-lg-3">
                  <div className="game-card">
                    <div className="position-relative">
                      <img src={game.thumbnail} className="card-img-top" alt={game.title} />
                      <button 
                        className={`btn position-absolute top-0 end-0 m-2 rounded-circle shadow-sm ${
                          favorites.some(f => f.id === game.id) ? 'btn-warning' : 'btn-light'
                        }`}
                        style={{ width: '40px', height: '40px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => handleToggleFavorite(game)}
                      >
                        <Star size={20} className={favorites.some(f => f.id === game.id) ? 'fill-current' : ''} />
                      </button>
                    </div>
                    <div className="card-body">
                      <h6 className="card-title fw-bold mb-2 text-truncate">{game.title}</h6>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="small text-muted">{game.genre}</span>
                        <span className="badge bg-light text-dark border">{game.platform}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Search size={48} className="mb-3 opacity-20" />
                <h3>No encontramos resultados</h3>
                <p>Prueba con otros términos de búsqueda.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-primary">Reseña: {selectedGame?.title}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <label className="form-label fw-semibold mb-3">¿Qué te pareció este juego?</label>
                <textarea 
                  className="form-control" 
                  rows="4"
                  placeholder="Escribe tu opinión aquí... (mínimo 5 caracteres para mayor calidad)"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                ></textarea>
                <p className="small text-muted mt-2">
                  <i className="bi bi-info-circle me-1"></i>
                  La reseña se guardará localmente en tu navegador.
                </p>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancelar</button>
                <button 
                  type="button" 
                  className="btn btn-primary px-4 rounded-pill shadow"
                  onClick={handleSaveReview}
                  disabled={!reviewText.trim()}
                >
                  Guardar Reseña
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
