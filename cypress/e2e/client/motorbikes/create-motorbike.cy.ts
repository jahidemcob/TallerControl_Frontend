/// <reference types="cypress" />

describe('Crear motocicleta como cliente y validarla en lista', () => {
  beforeEach(() => {
    // Login como cliente
    cy.request('POST', 'https://localhost:7240/auth/login', {
      username: 'prueba',
      clave: '123456',
    }).then((response) => {
      const token = response.body.token;

      cy.visit('http://localhost:4200/cliente', {
        onBeforeLoad(win) {
          const w = win as unknown as Window;

          w.localStorage.setItem('token', token);
          w.localStorage.setItem('usuario', JSON.stringify(response.body));
        },
      });
    });
  });

  it('debe crear una motocicleta y verificarla en el listado', () => {
    // Datos únicos
    const marca = 'Yamaha';
    const modelo = 'MT-09';

    // Generar placa formato XXX11X (3 letras, 2 números, 1 letra)
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letra = () => letras[Math.floor(Math.random() * letras.length)];
    const numero = () => Math.floor(Math.random() * 10);
    const placa = letra() + letra() + letra() + numero() + numero() + letra();

    // Ir al módulo de motocicletas
    cy.contains('Motocicletas').click();

    // Ir al formulario de creación
    cy.get('.btn-create').click();

    // Validar que estamos en el create
    cy.contains('Crear Motocicleta').should('be.visible');

    // Llenar formulario
    cy.get('input[name="marca"]').type(marca);
    cy.get('input[name="modelo"]').type(modelo);
    cy.get('input[name="placa"]').type(placa);
    cy.get('input[name="cilindraje"]').type('900');
    cy.get('input[name="anio"]').type('2022');

    // Enviar formulario
    cy.get('button[type="submit"]').click();

    // Validar que hubo respuesta exitosa
    cy.get('.success', { timeout: 10000 }).should('be.visible');

    // Redirección manual al listado
    cy.visit('http://localhost:4200/cliente/motocicletas');

    // Validar que el módulo cargó correctamente
    cy.contains('Gestión de Motocicletas', { timeout: 10000 }).should('be.visible');

    // Verificar que existe la card creada usando la placa
    cy.contains('.service-card', placa, { timeout: 10000 }).should('exist');
  });
});
