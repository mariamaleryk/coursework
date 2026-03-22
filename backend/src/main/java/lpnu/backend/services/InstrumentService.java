package lpnu.backend.services;

import lpnu.backend.models.Instrument;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class InstrumentService {
    private final Map<String, Instrument> repository = new ConcurrentHashMap<>();

    public List<Instrument> getAllInstruments() {
        return new ArrayList<>(repository.values());
    }

    public Instrument addInstrument(Instrument instrument) {
        repository.put(instrument.getId(), instrument);
        return instrument;
    }

    public void deleteInstrument(String id) {
        repository.remove(id);
    }

    public void clearAll() {
        repository.clear();
    }

    public Instrument updatePosition(String id, int x, int y) {
        Instrument instrument = repository.get(id);
        if (instrument != null) {
            instrument.setX(x);
            instrument.setY(y);
        }
        return instrument;
    }
}