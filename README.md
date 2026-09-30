# Sistema de Soporte para la Gestión de Redes en Entornos Industriales

## ¿Qué es este proyecto?

Es una plataforma de soporte que permite saber, en todo momento, si el enlace entre un punto de acceso remoto (por ejemplo, un ingeniero trabajando desde otra ciudad) y los equipos de una planta industrial está funcionando correctamente. La plataforma vigila cada tramo de ese enlace, avisa cuándo algo se cae, ayuda a identificar dónde ocurrió el problema, y además permite que el personal autorizado se conecte de forma segura a los equipos de planta cuando lo necesite, sin exponer la red industrial directamente a internet.

## El problema que resuelve

En un entorno industrial, cuando se pierde la comunicación entre el personal de ingeniería y los equipos de planta (por ejemplo, un PLC), no siempre es evidente dónde está el problema: puede ser el propio enlace de red, el equipo que hace de puente entre ambas redes, la red interna de la planta, o el equipo específico que se quiere alcanzar. Sin una herramienta centralizada, encontrar la causa exige revisar manualmente cada tramo, uno por uno, lo que retrasa tanto el diagnóstico como la solución.

Además, hoy en día conectarse de forma remota a un equipo de planta suele requerir accesos amplios y permanentes a la red industrial, lo cual es un riesgo de seguridad innecesario cuando en realidad el acceso solo se necesita puntualmente, mientras dura una tarea concreta.

## Cómo funciona en general

El sistema representa el camino completo entre el punto de acceso remoto y el equipo de planta como una serie de tramos conectados entre sí. De forma periódica, la plataforma revisa el estado de cada uno de esos tramos y de los equipos involucrados, incluyendo el estado operativo del PLC de planta. Cuando detecta que algo cambió —una caída o una recuperación— lo registra automáticamente: qué tramo se vio afectado, en qué momento empezó el problema, cuánto tiempo duró y cuándo se resolvió.

Toda esta información se presenta en un panel centralizado, donde el personal de soporte puede ver de un vistazo el estado general del enlace, identificar rápidamente en qué punto se originó una falla, y consultar el historial de incidentes ocurridos anteriormente. Esto reduce el tiempo que hoy se pierde haciendo verificaciones manuales y le da a la institución información concreta para tomar decisiones, como priorizar mantenimiento en los puntos que fallan con más frecuencia.

Sobre esa misma base de monitoreo se construye una segunda capa de valor: la plataforma también sirve como punto de partida para que el personal autorizado solicite, desde el mismo panel, una conexión segura y temporal hacia un equipo de planta específico, únicamente cuando lo necesita.

## Funcionalidades

Las funcionalidades del sistema se organizan en dos grandes bloques. El primero cubre todo lo relacionado con vigilar la red y diagnosticar problemas; el segundo, más amplio, cubre la capacidad de conectarse de forma remota y segura a los equipos de planta.

### 1. Monitoreo de red y diagnóstico de incidentes

- Registro y documentación de la topología del enlace: los distintos tramos que lo componen y los equipos involucrados en cada uno.
- Verificación periódica y automática de la disponibilidad de cada tramo del enlace.
- Medición de indicadores de calidad del enlace, como la latencia y la pérdida de paquetes, no solo si está disponible o no.
- Consulta del estado operativo del equipo de planta (PLC), para saber si está en funcionamiento normal o detenido.
- Detección automática de cambios de estado: cuándo un tramo deja de responder y cuándo se recupera.
- Identificación del tramo específico donde se origina una falla, para orientar el diagnóstico hacia la causa más probable en vez de dar solo un aviso genérico de "algo está mal".
- Registro de cada incidente detectado, con su fecha, hora de inicio, hora de recuperación y duración.
- Panel centralizado que muestra el estado general del enlace y el detalle de cada tramo, actualizado en tiempo real.
- Historial consultable de todos los incidentes ocurridos, útil para identificar problemas recurrentes y respaldar decisiones de mantenimiento.

### 2. Acceso remoto seguro a los equipos de planta

- Gestión de usuarios registrados con permiso para solicitar acceso remoto, de modo que solo personal autorizado pueda conectarse.
- Selección, desde el propio panel, del equipo de planta específico al que se desea conectar.
- El sistema solo permite iniciar una conexión hacia un equipo que esté reportado como disponible, evitando intentos de acceso a equipos que ya se sabe que están caídos.
- Establecimiento de una conexión segura y temporal entre el punto remoto y el equipo de planta seleccionado, habilitada únicamente mientras dura la sesión de trabajo.
- Una vez establecida la conexión, el personal autorizado puede usar sus herramientas de ingeniería habituales (como TIA Portal) para trabajar sobre el equipo de planta, como si estuviera conectado localmente.
- Cierre automático del acceso al finalizar la sesión o al vencer el tiempo permitido, sin dejar accesos abiertos de forma indefinida.
- Registro de accesos: quién se conectó, a qué equipo, en qué momento y por cuánto tiempo, conformando un historial auditable independiente del historial de incidentes.

## A quién está dirigido

A personal de soporte técnico y de ingeniería que necesita supervisar la salud de una red industrial y, cuando corresponda, acceder de forma remota y controlada a los equipos de planta para su configuración o mantenimiento, sin depender de accesos permanentes ni de verificaciones manuales.

## Estado del proyecto

Actualmente en etapa de diseño de arquitectura. El siguiente paso es el desarrollo de la plataforma (monitoreo, panel y acceso remoto) sobre un escenario de prueba con equipos reales.
