# Endpoints necesarios en el Backend (Spring Boot)

## 1. Obtener módulos por courseId

```java
@GetMapping("/api/v1/modules/course/{courseId}")
public ResponseEntity<?> getModulesByCourse(@PathVariable String courseId) {
    List<Module> modules = moduleRepository.findByCourse(courseId);
    return ResponseEntity.ok(modules);
}
```

**Repositorio necesario:**
```java
public interface ModuleRepository extends JpaRepository<Module, String> {
    List<Module> findByCourse(String courseId);
}
```

## 2. Obtener lecciones por moduleId

```java
@GetMapping("/api/v1/lessons/module/{moduleId}")
public ResponseEntity<?> getLessonsByModule(@PathVariable String moduleId) {
    List<Lesson> lessons = lessonRepository.findByModule(moduleId);
    return ResponseEntity.ok(lessons);
}
```

**Repositorio necesario:**
```java
public interface LessonRepository extends JpaRepository<Lesson, String> {
    List<Lesson> findByModule(String moduleId);
}
```

---

## Alternativa: Modificar el endpoint /api/v1/courses/all

Agregar `@JsonManagedReference` en la entidad Course para incluir módulos y lecciones:

```java
@Entity
public class Course {
    // ... otros campos
    
    @OneToMany(mappedBy = "course", fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Module> modules;
}

@Entity
public class Module {
    // ... otros campos
    
    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonBackReference
    private Course course;
    
    @OneToMany(mappedBy = "module", fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Lesson> lessons;
}

@Entity
public class Lesson {
    @ManyToOne
    @JoinColumn(name = "module_id")
    @JsonBackReference
    private Module module;
}
```

Luego modificar el controlador:

```java
@GetMapping("/api/v1/courses/all")
public ResponseEntity<?> getAllCourses() {
    List<Course> courses = courseRepository.findAll();
    // Forzar carga de módulos y lecciones
    courses.forEach(course -> {
        course.getModules().size(); // Trigger lazy loading
        course.getModules().forEach(module -> {
            module.getLessons().size(); // Trigger lazy loading
        });
    });
    return ResponseEntity.ok(courses);
}
```

---

## ¿Qué opción elegir?

- **Opción 1 (endpoints separados)**: Mejor rendimiento, carga bajo demanda
- **Opción 2 (eager loading)**: Más simple, pero puede ser lento con muchos cursos

Implementa la **Opción 1** agregando estos dos endpoints GET en tu backend.
