/// <reference types="cypress" />

describe('Login multi-rol (Admin, Empleado, Cliente)', () => {
  function login(username: string, password: string) {
    cy.visit('http://localhost:4200/login');

    cy.get('input[name="username"]').clear().type(username);
    cy.get('input[name="password"]').clear().type(password);

    cy.get('button[type="submit"]').click();
  }

  function validarDashboard(rol: string) {
    cy.contains(rol, { timeout: 10000 }).should('be.visible');

    // validación más específica (usuario en la esquina)
    cy.get('.username').should('contain.text', rol);
  }

  function cerrarSesion() {
    // abrir menú correctamente
    cy.get('.arrow', { timeout: 10000 }).should('be.visible').click();

    // esperar y hacer click en cerrar sesión
    cy.contains('Cerrar sesión', { timeout: 10000 }).should('be.visible').click();

    // validar que volvió al login
    cy.url().should('include', '/login');
  }

  it('debe iniciar sesión con los 3 roles correctamente', () => {
    //  ADMIN
    login('admin', '123456');
    validarDashboard('Administrador');
    cerrarSesion();

    //  EMPLEADO
    login('empleado', '1234567');
    validarDashboard('Empleado');
    cerrarSesion();

    //  CLIENTE
    login('cliente', '123456');
    validarDashboard('Cliente');
    cerrarSesion();
  });
});
