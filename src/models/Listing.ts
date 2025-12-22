import mongoose, { Schema, Document } from 'mongoose';

export interface IListing extends Document {
  name: string;
  city: string;
  nationality: string;
  hairColor: string;
  height: number;
  weight: number;
  age: number;
  price: number;
  services: string[];
  tags: string[];
  images: string[];
  description: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema: Schema = new Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  nationality: { type: String, required: true },
  hairColor: { type: String, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  age: { type: Number, required: true },
  price: { type: Number, required: true },
  services: [{ type: String }],
  tags: [{ type: String }],
  images: [{ type: String }],
  description: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

// Pre-save middleware to automatically assign tags based on listing properties
ListingSchema.pre('save', function(this: IListing, next: () => void) {
  const tags = new Set<string>();
  
  // Add nationality tags with variations
  if (this.nationality) {
    tags.add(this.nationality);
    tags.add(`${this.nationality} em Portugal`);
    if (this.nationality === 'Brasileira') {
      tags.add('Brasileiras');
      tags.add('Brasileiras em Portugal');
    }
    if (this.nationality === 'Portuguesa') {
      tags.add('Portuguesas');
      tags.add('Portuguesas em Portugal');
    }
  }
  
  // Add hair color tags with variations
  if (this.hairColor) {
    tags.add(this.hairColor);
    tags.add(`${this.hairColor} em Portugal`);
    if (this.hairColor === 'Loira') {
      tags.add('Loiras');
      tags.add('Loiras em Portugal');
    }
    if (this.hairColor === 'Morena') {
      tags.add('Morenas');
      tags.add('Morenas em Portugal');
    }
    if (this.hairColor === 'Ruiva') {
      tags.add('Ruivas');
      tags.add('Ruivas em Portugal');
    }
  }
  
  // Add service tags with variations
  if (this.services && this.services.length > 0) {
    this.services.forEach((service: string) => {
      tags.add(service);
      tags.add(`${service} em Portugal`);
      if (service === 'Webcam') {
        tags.add('Webcam em Portugal');
        tags.add('Sexo Virtual');
      }
      if (service === 'BDSM') {
        tags.add('BDSM em Portugal');
        tags.add('Fetish');
      }
    });
  }
  
  // Add age-based tags with variations
  if (this.age) {
    if (this.age >= 18 && this.age <= 25) {
      tags.add('Jovem');
      tags.add('Jovens');
      tags.add('Universitária');
      tags.add('Universitárias');
    }
    if (this.age >= 26 && this.age <= 35) {
      tags.add('Madura');
      tags.add('Maduras');
    }
    if (this.age > 35) {
      tags.add('MILF');
      tags.add('MILFs');
    }
  }
  
  // Add price-based tags with variations
  if (this.price) {
    if (this.price >= 200) {
      tags.add('VIP');
      tags.add('VIP em Portugal');
    }
    if (this.price >= 500) {
      tags.add('Elite');
      tags.add('Elite em Portugal');
      tags.add('Acompanhante de Luxo');
    }
    if (this.price <= 100) {
      tags.add('Econômica');
      tags.add('Acessível');
    }
  }
  
  // Add location-based tags with variations
  if (this.city) {
    tags.add(`Acompanhante em ${this.city}`);
    tags.add(`${this.city}`);
    tags.add(`Acompanhantes em ${this.city}`);
  }
  
  // Add body type tags based on height and weight
  if (this.height && this.weight) {
    const bmi = this.weight / Math.pow(this.height / 100, 2);
    if (bmi < 18.5) {
      tags.add('Magra');
      tags.add('Magras');
    } else if (bmi >= 18.5 && bmi < 25) {
      tags.add('Normal');
    } else if (bmi >= 25 && bmi < 30) {
      tags.add('Gordinha');
      tags.add('Gordinhas');
    }
  }
  
  // Add availability tags
  if (this.isActive) {
    tags.add('Disponível');
    tags.add('Disponível Agora');
  }
  
  // Add verification tags
  if (this.isVerified) {
    tags.add('Verificada');
    tags.add('Perfil Verificado');
  }
  
  // Convert Set to Array and assign to tags
  this.tags = Array.from(tags);
  
  next();
});

// Create indexes for better search performance
ListingSchema.index({ tags: 1 });
ListingSchema.index({ city: 1 });
ListingSchema.index({ nationality: 1 });
ListingSchema.index({ isActive: 1 });
ListingSchema.index({ isVerified: 1 });

export default mongoose.models.Listing || mongoose.model<IListing>('Listing', ListingSchema); 