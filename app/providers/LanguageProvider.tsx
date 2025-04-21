"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';

type Language = 'en' | 'hr';

type LanguageContextType = {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
};

// Translations dictionary
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.marketplace': 'Marketplace',
    'nav.dashboard': 'Dashboard',
    'nav.messages': 'Messages',
    'nav.admin': 'Admin',
    'nav.profile': 'Profile',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Logout',
    'nav.newListing': '+ New Listing',
    
    // Listings
    'listing.back': 'Back to listings',
    'listing.edit': 'Edit Listing',
    'listing.markSold': 'Mark as Sold',
    'listing.processing': 'Processing...',
    'listing.sold': 'Sold',
    'listing.category': 'Category',
    'listing.price': '€',
    'listing.location': 'Location',
    'listing.description': 'Description',
    'listing.condition': 'Condition',
    'listing.contactSeller': 'Contact Seller',
    'listing.sellerInfo': 'Seller Information',
    'listing.memberSince': 'Member since',
    'listing.listedOn': 'Listed on',
    'listing.noDescription': 'No description provided.',
    'listing.notSpecified': 'Not specified',
    'listing.viewAll': 'View All Listings',
    'listing.search': 'Search listings...',
    'listing.filter': 'Filter',
    'listing.sort': 'Sort',
    'listing.newest': 'Newest',
    'listing.oldest': 'Oldest',
    'listing.priceLowHigh': 'Price: Low to High',
    'listing.priceHighLow': 'Price: High to Low',
    
    // Profile
    'profile.title': 'Your Profile',
    'profile.accountDetails': 'Account Details',
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.verificationStatus': 'Verification Status',
    'profile.verified': 'Verified',
    'profile.notVerified': 'Not Verified',
    'profile.notProvided': 'Not provided',
    'profile.editProfile': 'Edit Profile',
    'profile.backToDashboard': 'Back to Dashboard',
    'profile.activeListings': 'Active Listings',
    'profile.soldItems': 'Sold Items',
    'profile.favorites': 'Favorites',
    'profile.noActiveListings': 'You don\'t have any active listings.',
    'profile.noSoldItems': 'You don\'t have any sold items.',
    'profile.noFavorites': 'You haven\'t saved any favorites yet.',
    'profile.listedOn': 'Listed on',
    'profile.views': 'views',
    'profile.messages': 'messages',
    'profile.edit': 'Edit',
    'profile.markAsSold': 'Mark as Sold',
    'profile.view': 'View',
    'profile.saveChanges': 'Save Changes',
    'profile.uploadPhoto': 'Upload Photo',
    'profile.changePassword': 'Change Password',
    
    // Create Listing
    'create.title': 'Create New Listing',
    'create.success': 'Your listing has been created successfully!',
    'create.titleField': 'Title',
    'create.descriptionField': 'Description',
    'create.priceField': 'Price (€)',
    'create.categoryField': 'Category',
    'create.selectCategory': 'Select a category',
    'create.locationField': 'Location',
    'create.imagesField': 'Images',
    'create.addImage': '+ Add Image',
    'create.imageNote': 'You can add up to 5 image URLs. For a real app, this would be an image upload feature.',
    'create.listActive': 'List as active right away',
    'create.cancel': 'Cancel',
    'create.creating': 'Creating...',
    'create.createListing': 'Create Listing',
    
    // Auth
    'auth.loginTitle': 'Login to Your Account',
    'auth.registerTitle': 'Create an Account',
    'auth.emailLabel': 'Email Address',
    'auth.passwordLabel': 'Password',
    'auth.confirmPasswordLabel': 'Confirm Password',
    'auth.rememberMe': 'Remember me',
    'auth.forgotPassword': 'Forgot password?',
    'auth.loginButton': 'Login',
    'auth.registerButton': 'Register',
    'auth.orContinueWith': 'Or continue with',
    'auth.alreadyAccount': 'Already have an account?',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.createOne': 'Create one',
    'auth.loginHere': 'Login here',
    
    // Dashboard
    'dashboard.welcome': 'Welcome,',
    'dashboard.notVerified': 'Your account is not verified',
    'dashboard.verifyPrompt': 'Verify your account to start selling items',
    'dashboard.verifyNow': 'Verify Now',
    'dashboard.stats': 'Your Statistics',
    'dashboard.activeSales': 'Active Sales',
    'dashboard.totalSold': 'Total Sold',
    'dashboard.totalViews': 'Total Views',
    'dashboard.messages': 'Messages',
    'dashboard.recentListings': 'Recent Listings',
    'dashboard.noListings': 'You haven\'t created any listings yet.',
    'dashboard.createFirst': 'Create your first listing',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.newListing': 'New Listing',
    'dashboard.viewMessages': 'View Messages',
    'dashboard.editProfile': 'Edit Profile',
    'dashboard.browseMarketplace': 'Browse Marketplace',
    
    // General
    'general.loading': 'Loading...',
    'general.error': 'An error occurred',
    'general.retry': 'Retry',
    'general.save': 'Save',
    'general.cancel': 'Cancel',
    'general.submit': 'Submit',
    'general.delete': 'Delete',
    'general.edit': 'Edit',
    'general.search': 'Search',
    'general.filter': 'Filter',
    'general.sort': 'Sort',
    'general.noResults': 'No results found',
  },
  hr: {
    // Navigation
    'nav.home': 'Početna',
    'nav.marketplace': 'Tržnica',
    'nav.dashboard': 'Kontrolna ploča',
    'nav.messages': 'Poruke',
    'nav.admin': 'Admin',
    'nav.profile': 'Profil',
    'nav.login': 'Prijava',
    'nav.signup': 'Registracija',
    'nav.logout': 'Odjava',
    'nav.newListing': '+ Novi oglas',
    
    // Listings
    'listing.back': 'Natrag na oglase',
    'listing.edit': 'Uredi oglas',
    'listing.markSold': 'Označi kao prodano',
    'listing.processing': 'Obrada...',
    'listing.sold': 'Prodano',
    'listing.category': 'Kategorija',
    'listing.price': '€',
    'listing.location': 'Lokacija',
    'listing.description': 'Opis',
    'listing.condition': 'Stanje',
    'listing.contactSeller': 'Kontaktiraj prodavača',
    'listing.sellerInfo': 'Informacije o prodavaču',
    'listing.memberSince': 'Član od',
    'listing.listedOn': 'Objavljeno',
    'listing.noDescription': 'Nema opisa.',
    'listing.notSpecified': 'Nije navedeno',
    'listing.viewAll': 'Pregledaj sve oglase',
    'listing.search': 'Pretraži oglase...',
    'listing.filter': 'Filtriraj',
    'listing.sort': 'Sortiraj',
    'listing.newest': 'Najnovije',
    'listing.oldest': 'Najstarije',
    'listing.priceLowHigh': 'Cijena: Od niže prema višoj',
    'listing.priceHighLow': 'Cijena: Od više prema nižoj',
    
    // Profile
    'profile.title': 'Vaš profil',
    'profile.accountDetails': 'Detalji računa',
    'profile.name': 'Ime',
    'profile.email': 'Email',
    'profile.verificationStatus': 'Status verifikacije',
    'profile.verified': 'Verificiran',
    'profile.notVerified': 'Nije verificiran',
    'profile.notProvided': 'Nije navedeno',
    'profile.editProfile': 'Uredi profil',
    'profile.backToDashboard': 'Natrag na kontrolnu ploču',
    'profile.activeListings': 'Aktivni oglasi',
    'profile.soldItems': 'Prodani artikli',
    'profile.favorites': 'Favoriti',
    'profile.noActiveListings': 'Nemate aktivnih oglasa.',
    'profile.noSoldItems': 'Nemate prodanih artikala.',
    'profile.noFavorites': 'Još niste spremili favorite.',
    'profile.listedOn': 'Objavljeno',
    'profile.views': 'pregleda',
    'profile.messages': 'poruka',
    'profile.edit': 'Uredi',
    'profile.markAsSold': 'Označi kao prodano',
    'profile.view': 'Pogledaj',
    'profile.saveChanges': 'Spremi promjene',
    'profile.uploadPhoto': 'Učitaj fotografiju',
    'profile.changePassword': 'Promijeni lozinku',
    
    // Create Listing
    'create.title': 'Kreiraj novi oglas',
    'create.success': 'Vaš oglas je uspješno kreiran!',
    'create.titleField': 'Naslov',
    'create.descriptionField': 'Opis',
    'create.priceField': 'Cijena (€)',
    'create.categoryField': 'Kategorija',
    'create.selectCategory': 'Odaberite kategoriju',
    'create.locationField': 'Lokacija',
    'create.imagesField': 'Slike',
    'create.addImage': '+ Dodaj sliku',
    'create.imageNote': 'Možete dodati do 5 URL-ova slika. Za pravu aplikaciju, ovo bi bila mogućnost prijenosa slika.',
    'create.listActive': 'Odmah objavi kao aktivno',
    'create.cancel': 'Odustani',
    'create.creating': 'Kreiranje...',
    'create.createListing': 'Kreiraj oglas',
    
    // Auth
    'auth.loginTitle': 'Prijava na račun',
    'auth.registerTitle': 'Kreiraj račun',
    'auth.emailLabel': 'Email adresa',
    'auth.passwordLabel': 'Lozinka',
    'auth.confirmPasswordLabel': 'Potvrdi lozinku',
    'auth.rememberMe': 'Zapamti me',
    'auth.forgotPassword': 'Zaboravili ste lozinku?',
    'auth.loginButton': 'Prijava',
    'auth.registerButton': 'Registracija',
    'auth.orContinueWith': 'Ili nastavi s',
    'auth.alreadyAccount': 'Već imate račun?',
    'auth.noAccount': 'Nemate račun?',
    'auth.createOne': 'Kreirajte ga',
    'auth.loginHere': 'Prijavite se',
    
    // Dashboard
    'dashboard.welcome': 'Dobrodošli,',
    'dashboard.notVerified': 'Vaš račun nije verificiran',
    'dashboard.verifyPrompt': 'Verificirajte račun kako biste mogli prodavati artikle',
    'dashboard.verifyNow': 'Verificiraj sada',
    'dashboard.stats': 'Vaša statistika',
    'dashboard.activeSales': 'Aktivne prodaje',
    'dashboard.totalSold': 'Ukupno prodano',
    'dashboard.totalViews': 'Ukupno pregleda',
    'dashboard.messages': 'Poruke',
    'dashboard.recentListings': 'Nedavni oglasi',
    'dashboard.noListings': 'Još nemate kreiranih oglasa.',
    'dashboard.createFirst': 'Kreirajte svoj prvi oglas',
    'dashboard.quickActions': 'Brze akcije',
    'dashboard.newListing': 'Novi oglas',
    'dashboard.viewMessages': 'Pregledaj poruke',
    'dashboard.editProfile': 'Uredi profil',
    'dashboard.browseMarketplace': 'Pregledaj tržnicu',
    
    // General
    'general.loading': 'Učitavanje...',
    'general.error': 'Došlo je do pogreške',
    'general.retry': 'Pokušaj ponovo',
    'general.save': 'Spremi',
    'general.cancel': 'Odustani',
    'general.submit': 'Pošalji',
    'general.delete': 'Izbriši',
    'general.edit': 'Uredi',
    'general.search': 'Pretraži',
    'general.filter': 'Filtriraj',
    'general.sort': 'Sortiraj',
    'general.noResults': 'Nema rezultata',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('hr'); // Default to Croatian

  useEffect(() => {
    // Load language from localStorage if available
    const savedLanguage = localStorage.getItem('language') as Language;
    
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hr')) {
      setLanguage(savedLanguage);
    } else {
      // If no language preference found, set Croatian as default
      localStorage.setItem('language', 'hr');
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'hr' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Translation function
  const t = (key: string): string => {
    const currentTranslations = translations[language];
    return currentTranslations[key as keyof typeof currentTranslations] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 