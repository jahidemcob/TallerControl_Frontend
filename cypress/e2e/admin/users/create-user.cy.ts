/// <reference types="cypress" />

describe('Crear usuario desde admin (sin login UI)', () => {
  beforeEach(() => {
    cy.request('POST', 'https://localhost:7240/auth/login', {
      username: 'admin',
      clave: '123456',
    }).then((response) => {
      const token = response.body.token;

      cy.visit('http://localhost:4200/admin/usuarios', {
        onBeforeLoad(win) {
          const w = win as unknown as Window;

          w.localStorage.setItem('token', token);
          w.localStorage.setItem('usuario', JSON.stringify(response.body));
        },
      });
    });
  });

  it('debe crear un usuario correctamente', () => {
    const username = 'test' + Date.now();
    const email = `test${Date.now()}@test.com`;

    cy.contains('Gestión de Usuarios', { timeout: 10000 }).should('be.visible');

    // abrir formulario
    cy.get('.btn-create').click();

    cy.contains('Crear Usuario').should('be.visible');

    // llenar datos
    cy.get('input[name="nombre"]').type('Usuario Test');
    cy.get('input[name="nombreUsuario"]').type(username);
    cy.get('input[name="telefono"]').type('3001234567');
    cy.get('input[name="correo"]').type(email);
    cy.get('input[name="clave"]').type('123456');

    cy.get('select[name="idRol"]').select('2');

    // guardar
    cy.get('button[type="submit"]').click();

    // volver a tabla
    cy.contains('Gestión de Usuarios', { timeout: 10000 }).should('be.visible');

    // esperar que carguen filas
    cy.get('.body-table tbody tr').should('have.length.greaterThan', 0);

    // SCROLL AL FINAL (CLAVE)
    // @ts-ignore
    cy.get('.table-scroll').scrollTo('bottom');

    // validar último registro
    cy.get('.body-table tbody tr').last().should('contain.text', username);
  });
});
