package lpnu.backend.controllers;

import lpnu.backend.models.Instrument;
import lpnu.backend.services.InstrumentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instruments")
@CrossOrigin(origins = "http://localhost:5173")
public class InstrumentController {

    private final InstrumentService service;

    public InstrumentController(InstrumentService service) {
        this.service = service;
    }

    @GetMapping
    public List<Instrument> getAll() {
        return service.getAllInstruments();
    }

    @PostMapping
    public Instrument create(@RequestBody Instrument instrument) {
        return service.addInstrument(instrument);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.deleteInstrument(id);
    }

    @DeleteMapping
    public void deleteAll() {
        service.clearAll();
    }

    @PutMapping("/{id}/position")
    public Instrument updatePosition(@PathVariable String id, @RequestParam int x, @RequestParam int y) {
        return service.updatePosition(id, x, y);
    }
}