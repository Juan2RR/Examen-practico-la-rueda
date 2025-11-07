import { Component } from '@angular/core';
import { ApiService } from './services/api.services.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  // Estado de autenticación
  isLoggedIn = false;
  userEmail = '';

  // Credenciales de login
  loginEmail = '';
  loginPassword = '';
  loginError = '';
  loginLoading = false;

  // Tab activo
  activeTab = 'list';

  // Lista de contactos
  contacts: any[] = [];
  currentPage = 1;
  lastPage = 1;
  totalContacts = 0;
  searchQuery = '';
  contactsLoading = false;
  contactsError = '';

  // Crear contacto
  newContact = {
    nombre: '',
    celular: '',
    placa: '',
  };
  createSuccess = '';
  createError = '';
  createLoading = false;

  // Carga masiva
  bulkJson = '';
  bulkSuccess = '';
  bulkError = '';
  bulkLoading = false;

  constructor(private apiService: ApiService) {}

  // Login
  onLogin() {
    this.loginLoading = true;
    this.loginError = '';
    this.apiService.login(this.loginEmail, this.loginPassword).subscribe(
      (response) => {
        if (response.token) {
          this.apiService.token = response.token;
          this.userEmail = response.user.email;
          this.isLoggedIn = true;
          this.loadContacts();
        }
        this.loginLoading = false;
      },
      (error) => {
        this.loginError = error.error?.message || 'Error al iniciar sesión';
        this.loginLoading = false;
      }
    );
  }

  // Logout
  onLogout() {
    this.apiService.token = null;
    this.isLoggedIn = false;
    this.loginEmail = 'cand_0016@larueda.com';
    this.loginPassword = 'Password123';
    this.contacts = [];
    this.currentPage = 1;
  }

  // Cambiar tab
  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'list') {
      this.loadContacts();
    }
  }

  // Cargar contactos
  loadContacts(page: number = 1) {
    this.contactsLoading = true;
    this.contactsError = '';
    this.currentPage = page;
    this.apiService.getContacts(page, 10, this.searchQuery).subscribe(
      (response) => {
        this.contacts = response.data || [];
        this.currentPage = response.current_page || 1;
        this.lastPage = response.last_page || 1;
        this.totalContacts = response.total || 0;
        this.contactsLoading = false;
      },
      (error) => {
        this.contactsError =
          error.error?.message || 'Error al cargar contactos';
        this.contactsLoading = false;
      }
    );
  }

  // Búsqueda
  onSearch() {
    this.currentPage = 1;
    this.loadContacts(1);
  }

  // Crear contacto

  // validar inputs
  celularInvalido = false;
  placaInvalida = false;

  onCreateContact() {
    // PRIMERO: Limpiar mensajes
    this.createSuccess = '';
    this.createError = '';

    // SEGUNDO: Validar celular (10 dígitos)
    const celularPattern = /^[0-9]{10}$/;
    if (
      !this.newContact.celular ||
      !celularPattern.test(this.newContact.celular)
    ) {
      this.celularInvalido = true;
      this.createError =
        'El celular debe contener exactamente 10 dígitos numéricos';
      return; // DETENER AQUÍ - no permite guardar
    }

    // TERCERO: Validar placa SI se ingresó algo
    if (this.newContact.placa && this.newContact.placa.trim() !== '') {
      const placaPattern = /^[A-Z]{3}[0-9]{3}$/;
      if (!placaPattern.test(this.newContact.placa)) {
        this.placaInvalida = true;
        this.createError =
          'La placa debe tener 3 letras seguidas de 3 números (ejemplo: WCN635)';
        return; // DETENER AQUÍ - no permite guardar
      }
    }

    // CUARTO: Si pasó las validaciones, limpiar errores y proceder
    this.celularInvalido = false;
    this.placaInvalida = false;
    this.createLoading = true;

    // QUINTO: Hacer la petición a la API
    this.apiService.createContact(this.newContact).subscribe({
      next: (response) => {
        this.createSuccess = 'Contacto creado exitosamente';
        this.createLoading = false;
        this.resetCreateForm();
        this.setActiveTab('list');
        this.loadContacts(1);
      },
      error: (error) => {
        this.createError = error.error?.message || 'Error al crear el contacto';
        this.createLoading = false;
      },
    });
  }

  // limpiar cuando corrija el ususario

  onCelularChange() {
    const celularPattern = /^[0-9]{10}$/;
    this.celularInvalido = this.newContact.celular
      ? !celularPattern.test(this.newContact.celular)
      : false;
  }

  onPlacaChange() {
    // Convertir a mayúsculas automáticamente
    if (this.newContact.placa) {
      this.newContact.placa = this.newContact.placa.toUpperCase();

      // Validar formato: 3 letras + 3 números
      const placaPattern = /^[A-Z]{3}[0-9]{3}$/;
      this.placaInvalida = !placaPattern.test(this.newContact.placa);
    } else {
      // Si está vacío, no mostrar error (es opcional)
      this.placaInvalida = false;
    }
  }

  // Carga masiva
  onBulkCreate() {
  this.bulkLoading = true;
  this.bulkError = '';
  this.bulkSuccess = '';

  try {
    // PRIMERO: Intentar parsear el JSON
    const data = JSON.parse(this.bulkJson);
    
    // SEGUNDO: Validar que existe el array de rows
    if (!data.rows || !Array.isArray(data.rows)) {
      this.bulkError = 'El JSON debe tener una propiedad "rows" con un array de contactos';
      this.bulkLoading = false;
      return;
    }

    // TERCERO: Validar que no esté vacío
    if (data.rows.length === 0) {
      this.bulkError = 'El array de contactos está vacío. Agrega al menos un contacto.';
      this.bulkLoading = false;
      return;
    }

    // CUARTO: Validar cada contacto
    const celularPattern = /^[0-9]{10}$/;
    const placaPattern = /^[A-Z]{3}[0-9]{3}$/;
    
    for (let i = 0; i < data.rows.length; i++) {
      const contacto = data.rows[i];
      const posicion = i + 1;

      // Validar que tenga nombre
      if (!contacto.nombre || contacto.nombre.trim() === '') {
        this.bulkError = `Contacto ${posicion}: El nombre es obligatorio`;
        this.bulkLoading = false;
        return;
      }

      // Validar celular (obligatorio y 10 dígitos)
      if (!contacto.celular) {
        this.bulkError = `Contacto ${posicion} (${contacto.nombre}): El celular es obligatorio`;
        this.bulkLoading = false;
        return;
      }

      if (!celularPattern.test(contacto.celular)) {
        this.bulkError = `Contacto ${posicion} (${contacto.nombre}): El celular debe tener exactamente 10 dígitos numéricos. Valor actual: "${contacto.celular}"`;
        this.bulkLoading = false;
        return;
      }

      // Validar placa (opcional, pero si existe debe tener formato correcto)
      if (contacto.placa && contacto.placa.trim() !== '') {
        // Convertir a mayúsculas
        contacto.placa = contacto.placa.toUpperCase();
        
        if (!placaPattern.test(contacto.placa)) {
          this.bulkError = `Contacto ${posicion} (${contacto.nombre}): La placa debe tener 3 letras seguidas de 3 números (ejemplo: WCN635). Valor actual: "${contacto.placa}"`;
          this.bulkLoading = false;
          return;
        }
      }
    }

    // QUINTO: Si todo está correcto, enviar a la API
    this.apiService.bulkCreateContacts(data).subscribe({
      next: (response) => {
        this.bulkSuccess = `✅ ${data.rows.length} contacto(s) creado(s) exitosamente`;
        this.bulkLoading = false;
        this.bulkJson = '';
        this.setActiveTab('list');
        this.loadContacts(1);
      },
      error: (error) => {
        this.bulkError = error.error?.message || 'Error al cargar los contactos';
        this.bulkLoading = false;
      }
    });

  } catch (error) {
    // Error al parsear JSON
    this.bulkError = 'JSON inválido. Verifica el formato y las comillas.';
    this.bulkLoading = false;
  }
}



  // Limpiar formularios
  resetCreateForm() {
    this.newContact = { nombre: '', celular: '', placa: '' };
    this.createError = '';
    this.createSuccess = '';
  }
  resetBulkForm() {
    this.bulkJson = '';
    this.bulkError = '';
    this.bulkSuccess = '';
  }
}
