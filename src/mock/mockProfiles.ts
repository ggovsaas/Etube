const mockProfiles = [
  {
    id: 1,
    name: 'Sofia 1',
    age: 20,
    city: 'Lisboa',
    price: 100,
    rating: 5,
    isVerified: true,
    isOnline: true,
    media: [
      { url: 'https://images.unsplash.com/photo-1519501025260-44e5c1a3d4c6?w=400&q=80' },
      { url: 'https://images.unsplash.com/photo-1519501025261-44e5c1a3d4c7?w=400&q=80' }
    ],
    phoneNumber: '938377',
    _count: { reviews: 10, questions: 2 },
    height: 155,
    weight: 45,
    reviews: 10,
    image: 'https://images.unsplash.com/photo-1519501025260-44e5c1a3d4c6?w=400&q=80',
    description: 'Olá, sou a Sofia! Uma acompanhante elegante e sofisticada, pronta para proporcionar momentos únicos e inesquecíveis. Discreta e carinhosa.'
  },
  {
    id: 2,
    name: 'Sofia 2',
    age: 21,
    city: 'Porto',
    price: 125,
    rating: 5,
    isVerified: false,
    isOnline: true,
    media: [
      { url: 'https://images.unsplash.com/photo-1519501025261-44e5c1a3d4c7?w=400&q=80' }
    ],
    phoneNumber: '938378',
    _count: { reviews: 11, questions: 1 },
    height: 156,
    weight: 46,
    reviews: 11,
    image: 'https://images.unsplash.com/photo-1519501025261-44e5c1a3d4c7?w=400&q=80',
    description: 'Sou Sofia do Porto, pronta para novas experiências.'
  },
  {
    id: 3,
    name: 'Sofia 3',
    age: 22,
    city: 'Coimbra',
    price: 150,
    rating: 5,
    isVerified: true,
    isOnline: false,
    media: [
      { url: 'https://images.unsplash.com/photo-1519501025262-44e5c1a3d4c8?w=400&q=80' }
    ],
    phoneNumber: '938379',
    _count: { reviews: 12, questions: 3 },
    height: 157,
    weight: 47,
    reviews: 12,
    image: 'https://images.unsplash.com/photo-1519501025262-44e5c1a3d4c8?w=400&q=80',
    description: 'A melhor companhia em Coimbra.'
  }
];

export default mockProfiles; 