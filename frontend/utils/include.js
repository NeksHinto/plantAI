async function loadComponents() {
  const components = document.querySelectorAll("[data-include]");

  await Promise.all(
    [...components].map(async (component) => {
      const response = await fetch(component.dataset.include);

      if (!response.ok) {
        throw new Error(`No se pudo cargar ${component.dataset.include}`);
      }

      component.outerHTML = await response.text();
    })
  );

  document.dispatchEvent(new CustomEvent("components:loaded"));
}

document.addEventListener("DOMContentLoaded", loadComponents);
