/// <reference types="cypress" />

describe('Editar último servicio desde admin', () => {
  beforeEach(() => {
    cy.request('POST', 'https://localhost:7240/auth/login', {
      username: 'admin',
      clave: '123456',
    }).then((response) => {
      const token = response.body.token;

      cy.visit('http://localhost:4200/admin', {
        onBeforeLoad(win) {
          const w = win as unknown as Window;

          w.localStorage.setItem('token', token);
          w.localStorage.setItem('usuario', JSON.stringify(response.body));
        },
      });
    });
  });

  it('debe editar el último servicio correctamente', () => {
    const nuevoNombre = 'Servicio Editado ' + Date.now();
    const nuevaDescripcion = 'Descripcion editada';
    const nuevoPrecio = '80000';

    // Ir a servicios
    cy.contains('Servicios').click();
    cy.contains('Gestión de Servicios', { timeout: 10000 }).should('be.visible');

    // Asegurar que existen servicios
    cy.get('.service-card').should('have.length.greaterThan', 0);

    // Tomar el último servicio visible
    cy.get('.service-card')
      .last()
      .within(() => {
        cy.contains('Editar').click();
      });

    // Formulario de edición
    cy.contains('Editar Servicio', { timeout: 10000 }).should('be.visible');

    cy.get('input[name="nombreServicio"]').clear().type(nuevoNombre);
    cy.get('textarea[name="descripcion"]').clear().type(nuevaDescripcion);
    cy.get('input[name="precioBase"]').clear().type(nuevoPrecio);

    cy.get('button[type="submit"]').click();

    // Validar redirección automática
    cy.contains('Gestión de Servicios', { timeout: 10000 }).should('be.visible');

    // Validar que el último servicio fue actualizado
    cy.get('.service-card')
      .last()
      .within(() => {
        cy.contains(nuevoNombre).should('exist');
        cy.contains(nuevaDescripcion).should('exist');

        cy.get('.service-price').invoke('text').should('not.be.empty');
      });
  });
});
